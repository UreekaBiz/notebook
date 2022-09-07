import { Editor } from '@tiptap/core';
import { NodeSelection, Selection, TextSelection } from 'prosemirror-state';
import { Step } from 'prosemirror-transform';

import { isNodeSelection, AbstractDocumentUpdate, NotebookSchemaType } from '@ureeka-notebook/web-service';

// ********************************************************************************
/**
 * apply the combined effects of the given {@link AbstractDocumentUpdate}s
 * in a single Transaction, effectively combining the effects of the Commands that
 * use them
 */
export const applyDocumentUpdates = (editor: Editor, documentUpdates: AbstractDocumentUpdate[]): boolean => {
  const steps: Step<NotebookSchemaType>[] = [];
  let finalSelection: Selection<NotebookSchemaType> = editor.state.selection/*default*/;

  let currentState = editor.state/*default starting state*/;
  for(let i=0; i<documentUpdates.length; i++) {
    // get the Transaction resulting from applying the DocumentUpdate
    // to the current EditorState
    const newTr = documentUpdates[i].update(currentState, currentState.tr);

    // either all DocumentUpdates are valid and applied, or none of them are applied
    if(!newTr) {
      return false/*at least one update was not valid (SEE: AbstractDocumentUpdate)*/;
    } /* else -- valid update */

    // save the Transaction's steps and update the current State
    for(let i = 0; i<newTr.steps.length; i++) {
      steps.push(newTr.steps[i]);
    }
    currentState = currentState.apply(newTr);

    // ensure the final Transaction receives the final Selection
    if(i === documentUpdates.length-1/*last Transaction*/) {
      finalSelection = newTr.selection;
    } /* else -- do not change default */
  }

  // create final, applied Transaction
  const finalTransaction = editor.state.tr/*new Transaction*/;
  for(let i=0; i<steps.length; i++) {
    finalTransaction.step(steps[i]);
  }
  if(isNodeSelection(finalSelection)) {
    finalTransaction.setSelection(NodeSelection.create(finalTransaction.doc, finalSelection.from));
  } else {
    finalTransaction.setSelection(TextSelection.create(finalTransaction.doc, finalSelection.anchor, finalSelection.head));
  }

  editor.view.dispatch(finalTransaction);
  setTimeout(() => editor.view.focus()/*right after changes*/);
  return true/*updates applied*/;
};
