import { CommandProps } from '@tiptap/core';

import { setMarkCommand, Command, CommandFunctionType, LinkAttributes, MarkName, PREVENT_LINK_META } from '@ureeka-notebook/web-service';

// ********************************************************************************
// == Type ========================================================================
// NOTE: Usage of ambient module to ensure command is TypeScript-registered
declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    [MarkName.LINK/*Expected and guaranteed to be unique. (SEE: /notebookEditor/model/node)*/]: {
      /** Toggle a link mark */
      toggleLink: CommandFunctionType<typeof toggleLinkCommand, ReturnType>;
      /** Unset a link mark */
      unsetLink: CommandFunctionType<typeof unsetLinkCommand, ReturnType>;
    };
  }
}

// == Implementation ==============================================================
// NOTE: the desired behavior for these Commands is that creating a Link in a
//       Range that includes Nodes that should not have Links (e.g. a Selection
//       that spans Text and CodeBlock Nodes) should create two separate Links,
//       one before the CodeBlock and another one past it
export const setLinkCommand = (attributes: Partial<LinkAttributes>): Command => (state, dispatch) => {
  state.tr.setMeta(PREVENT_LINK_META, true/*(SEE: ../plugin.ts)*/);
  return setMarkCommand(state.schema, MarkName.LINK, attributes)(state, dispatch);
};

export const toggleLinkCommand = (attributes: Partial<LinkAttributes>) => ({ chain }: CommandProps) =>
      chain()
      .toggleMark(MarkName.LINK, attributes, { extendEmptyMarkRange: true })
      .setMeta(PREVENT_LINK_META, true)
      .run();

export const unsetLinkCommand = () => ({ chain }: CommandProps) =>
    chain()
    .unsetMark(MarkName.LINK, { extendEmptyMarkRange: true })
    .setMeta(PREVENT_LINK_META, true)
    .run();
