import { CommandProps } from '@tiptap/core';

import { CommandFunctionType, LinkAttributes, MarkName, PREVENT_LINK_META } from '@ureeka-notebook/web-service';

// ********************************************************************************
// == Type ========================================================================
// NOTE: Usage of ambient module to ensure command is TypeScript-registered
declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    [MarkName.LINK/*Expected and guaranteed to be unique. (SEE: /notebookEditor/model/node)*/]: {
      /** Set a link mark */
      setLink: CommandFunctionType<typeof setLinkCommand, ReturnType>;
      /** Toggle a link mark */
      toggleLink: CommandFunctionType<typeof toggleLinkCommand, ReturnType>;
      /** Unset a link mark */
      unsetLink: CommandFunctionType<typeof unsetLinkCommand, ReturnType>;
    };
  }
}

// == Implementation ==============================================================
export const setLinkCommand = (attributes: Partial<LinkAttributes>) => ({ chain }: CommandProps) =>
    chain()
    .setMark(MarkName.LINK, attributes)
    .setMeta(PREVENT_LINK_META, true)
    .run();

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
