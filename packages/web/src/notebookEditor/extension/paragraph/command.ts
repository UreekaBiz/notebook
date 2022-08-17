import { CommandProps } from '@tiptap/core';
import { TextSelection } from 'prosemirror-state';

import { createParagraphNode, getBlockNodeRange, CommandFunctionType, NodeName } from '@ureeka-notebook/web-service';

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
export const setParagraphCommand = () => ({ tr, dispatch, view }: CommandProps) => ((tr, dispatch, view) => {
  const { from, to } = getBlockNodeRange(tr.selection);
  const textContent = tr.doc.textBetween(from, to, '\n'/*insert for every Block Node*/);
  const resolvedFrom = tr.doc.resolve(from - 1/*select the whole parent*/),
        resolvedTo = tr.doc.resolve(to + 1/*select the whole parent*/);

  // NOTE: this is specifically replacing the selection instead of calling
  //       setBlockType to account for the case where the Paragraph's only
  //       Content is a MarkHolder Node, which gets deleted by the
  //       command (effectively removing Marks on next input)
  tr.setSelection(new TextSelection(resolvedFrom, resolvedTo))
    .replaceSelectionWith(createParagraphNode(view?.state.schema, undefined/*do not specify attrs*/, textContent.length > 0 ? view?.state.schema.text(textContent) : undefined/*no content*/));

  if(dispatch) dispatch(tr);
  return true/*can be executed*/;
})(tr, dispatch, view);
