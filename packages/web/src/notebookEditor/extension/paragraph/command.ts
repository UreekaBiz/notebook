import { CommandProps } from '@tiptap/core';

import { CommandFunctionType, NodeName } from '@ureeka-notebook/web-service';

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
export const setParagraphCommand = () => ({ state, chain }: CommandProps) => {
  const { selection } = state;
  const { parentOffset } = selection.$anchor,
        from = selection.$anchor.pos - parentOffset,
        to = from + selection.$anchor.parent.nodeSize - 2/*inside the paragraph*/;

  return chain()
          .setTextSelection({ from, to })
          .unsetAllMarks()
          .setNode(NodeName.PARAGRAPH)
          .setTextSelection(to)
        .run();
};
