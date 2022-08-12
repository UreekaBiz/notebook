import { CommandProps } from '@tiptap/core';

import { getBlockNodeRange, CommandFunctionType, NodeName } from '@ureeka-notebook/web-service';

// ********************************************************************************
// NOTE: ambient module to ensure command is TypeScript-registered for TipTap
declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    [NodeName.PARAGRAPH/*Expected and guaranteed to be unique. (SEE: /notebookEditor/model/node)*/]: {
      /** Toggle a paragraph */
      setParagraph: CommandFunctionType<typeof setParagraphCommand, ReturnType>;
    };
  }
}

// --------------------------------------------------------------------------------
export const setParagraphCommand = () => ({ state, chain }: CommandProps) =>
  chain()
    .setTextSelection(getBlockNodeRange(state.selection))
    .unsetAllMarks()
    .setNode(NodeName.PARAGRAPH)
    .setTextSelection(state.selection.$anchor.pos)
    .run();
