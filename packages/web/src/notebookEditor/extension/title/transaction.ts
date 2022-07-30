import { Mark, Node as ProseMirrorNode } from 'prosemirror-model';
import { Transaction } from 'prosemirror-state';

import { isTextStyleMark, isTitleNode, wereNodesAffectedByTransaction, NodeName } from '@ureeka-notebook/web-service';

import { TitleStorage } from './type';
import { DATA_TITLE_PLACEHOLDER } from './Title';

// ********************************************************************************
// == Constants ===================================================================
// NOTE: constants not in 'Title.ts' since these are only used within this transaction
const TitleSet = new Set([NodeName.TITLE]);

// == Transaction =================================================================
// updates the placeholder if the selection is in Title, the Title is empty and
// there are stored Marks
export const onTransactionTitle = (transaction: Transaction, storage: TitleStorage) => {
  const { selection } = transaction;
  if(isTitleNode(selection.$anchor.parent) &&
    selection.$anchor.parent.attrs.initialMarksSet/*initialMarks already set*/ &&
    !selection.$anchor.parent.textContent.length/*Title is empty*/) {
    const storedMarks = transaction.storedMarks
      ? transaction.storedMarks
      : [/*no stored marks*/];

    updatePlaceholder(storage.titleView, selection.$anchor.parent, storedMarks);
    return;
  } /* else -- selection is not at the Title itself, check if the transaction modified the content of the Title */

  if(!wereNodesAffectedByTransaction(transaction, TitleSet)) {
    return/*Title was not affected by transaction*/;
  }/* else -- remove marks from placeholder */

  updatePlaceholder(storage.titleView, transaction.doc.child(0)/*by contract since there will always be only 1 Title*/, [/*remove Marks*/]);
};

// == Util ========================================================================
const updatePlaceholder = (titleView: HTMLDivElement, titleNode: ProseMirrorNode, marks?: Mark[]) => {
  titleView.setAttribute(DATA_TITLE_PLACEHOLDER, titleNode.textContent.length === 0 ? 'Untitled' : '');
  if(!marks || marks.length < 1) {/*no Marks to apply next time the User types*/
    titleView.removeAttribute('class')/*remove all classes*/;
    titleView.removeAttribute('style')/*remove all styling*/;
    return/*nothing to do*/;
  }/* else -- add Mark name styles to placeholder */

  titleView.setAttribute('class', '')/*reset so that only currently stored marks get applied*/;
  titleView.setAttribute('style', '')/*reset so that right style is applied*/;

  // NOTE: classes must match in index.css
  marks.forEach(mark => {
    // NOTE: TextStyle is a special case since the only effect it can have on the
    //       placeholder is changing its fontSize
    if(isTextStyleMark(mark)) {
      titleView.setAttribute('style', `font-size: ${mark.attrs.fontSize}`);
    }/* else -- add the mark name as class */

    titleView.classList.add(mark.type.name);
  });
};
