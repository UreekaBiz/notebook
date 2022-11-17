import { ParseOptions } from 'prosemirror-model';
import { EditorState, Selection, Transaction } from 'prosemirror-state';
import { ReplaceStep, ReplaceAroundStep } from 'prosemirror-transform';

import { AbstractDocumentUpdate, Command, JSONNode, SelectionRange } from '@ureeka-notebook/web-service';

import { createNodeFromContent, isFragment } from 'notebookEditor/extension/util/node';

// ********************************************************************************

// -- Insertion -------------------------------------------------------------------
type InsertContentAtOptions = {
  parseOptions?: ParseOptions;
  updateSelection?: boolean;
}
// NOTE: this Command is limited to Web since the content that gets inserted must
//       might be a string that gets parsed and converted into an HTMLElement
/** Insert the given content at the specified SelectionRange */
export const insertContentAtCommand = (selectionRange: SelectionRange, value: string | JSONNode | JSONNode[], options?: InsertContentAtOptions): Command => (state, dispatch) => {
  const updatedTr = new InsertContentAtDocumentUpdate(selectionRange, value, options).update(state, state.tr);
  if(updatedTr) {
    dispatch(updatedTr);
    return true/*Command executed*/;
  } /* else -- Command cannot be executed */

  return false/*not executed*/;
};
export class InsertContentAtDocumentUpdate implements AbstractDocumentUpdate  {
  public constructor(private readonly selectionRange: SelectionRange, private readonly value: string | JSONNode | JSONNode[], private readonly options?: InsertContentAtOptions) {/*nothing additional*/}

  // NOTE: this is inspired by https://github.com/ueberdosis/tiptap/blob/8c6751f0c638effb22110b62b40a1632ea6867c9/packages/core/src/commands/insertContentAt.ts
  /**
   * modify the given Transaction such that the given content is inserted at
   * the specified SelectionRange and return it
   */
  public update(editorState: EditorState, tr: Transaction) {
    const options = { parseOptions: {/*default none*/}, updateSelection: true, ...this.options };
    const content = createNodeFromContent(editorState.schema, this.value, { parseOptions: { preserveWhitespace: 'full', ...options.parseOptions } });

    // do not dispatch an empty Fragment
    if(content.toString() === '<>') {
      return false/*invalid Fragment*/;
    } /* else -- valid Fragment */

    let isOnlyTextContent = false/*default*/;
    let isOnlyBlockContent = false/*default*/;
    const nodesInContent = isFragment(content) ? content : [content];
    nodesInContent.forEach(node => {
      node.check()/*check that content is valid*/;

      if(node.isText && node.marks.length === 0) {
        isOnlyTextContent = true;
      } /* else -- do not change default */

      if(node.isBlock) {
        isOnlyBlockContent = true;
      } /* else -- do not change default */
    });

    // check if wrapping Node can be replaced entirely
    let { from, to } = this.selectionRange;
    if(from === to && isOnlyBlockContent) {
      const { parent } = tr.doc.resolve(from);
      const isEmptyTextBlock = parent.isTextblock
        && !parent.type.spec.code
        && !parent.childCount;

      if(isEmptyTextBlock) {
        from -= 1;
        to += 1;
      } /* else -- not an empty textBlock */
    }

    if(isOnlyTextContent && typeof this.value === 'string'/*for sanity*/) {
      // NOTE: insertText ensures Marks are kept
      tr.insertText(this.value, from, to);
    } else {
      tr.replaceWith(from, to, content);
    }

    if(options.updateSelection) {
      setTransactionSelectionToInsertionEnd(tr, tr.steps.length - 1/*start from last step*/, -1/*bias to the left*/);
    } /* else -- do not update Selection */
    return tr/*updated*/;
  }
}

// --------------------------------------------------------------------------------
// NOTE: this is inspired by https://github.com/ProseMirror/prosemirror-state/blob/4faf6a1dcf45747e6d7cefd7e934759f3fa5b0d0/src/selection.ts#L454
/**
 * Set the Selection of a Transaction to the end of its
 * inserted Content, if it inserted Content
 */
const setTransactionSelectionToInsertionEnd = (tr: Transaction, startingStepLength: number, bias: number) => {
  const lastStepIndex = tr.steps.length - 1;
  if(lastStepIndex < startingStepLength) {
    return/*nothing to do*/;
  } /* else -- valid index */

  const lastStep = tr.steps[lastStepIndex];
  if(!(lastStep instanceof ReplaceStep || lastStep instanceof ReplaceAroundStep)) return/*last Step did not insert or replace contnet*/;

  // set end to the immediate newTo of the last Mapping
  const lastMap = tr.mapping.maps[lastStepIndex];
  let selectionEnd = 0/*default*/;
  lastMap.forEach((from, to, newFrom, newTo) => selectionEnd = newTo);

  tr.setSelection(Selection.near(tr.doc.resolve(selectionEnd), bias));
};
