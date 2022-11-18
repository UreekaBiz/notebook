import { Node as ProseMirrorNode } from 'prosemirror-model';
import { Transaction } from 'prosemirror-state';
import { Transform } from 'prosemirror-transform';

import { deduplicate } from '../../../util/array';
import { SelectionRange } from '../command/selection';

// ********************************************************************************
// -- Step ------------------------------------------------------------------------
/** Return new {@link Transform} based on all steps of the given Transactions */
export const combineTransactionSteps = (oldDoc: ProseMirrorNode, transactions: Transaction[]): Transform => {
  const combinedTransform = new Transform(oldDoc/*starting Document*/);
  transactions.forEach(transaction => transaction.steps.forEach(step => combinedTransform.step(step)));
  return combinedTransform;
};

// -- Change ----------------------------------------------------------------------
// .. Type ........................................................................
export type ChangedRangeType = { oldRange: SelectionRange; newRange: SelectionRange; }

// .. Util ........................................................................
// NOTE: this is inspired by https://github.com/ueberdosis/tiptap/blob/8c6751f0c638effb22110b62b40a1632ea6867c9/packages/core/src/helpers/getChangedRanges.ts
/** remove duplicated ranges and ranges that are fully captured by other ranges */
export const simplifyChangedRanges = (changedRanges: ChangedRangeType[]): ChangedRangeType[] => {
  const uniqueChangedRanges = deduplicate(changedRanges);

  if(uniqueChangedRanges.length === 1) {
    return uniqueChangedRanges;
  } else {
    const filteredUniqueChanges = uniqueChangedRanges.filter((change, changeIndex) => {
        const remainingChanges = uniqueChangedRanges.filter((remainingChanges, remainingChangeIndex) => remainingChangeIndex !== changeIndex);
        return !remainingChanges.some(otherChange =>
                change.oldRange.from >= otherChange.oldRange.from
                && change.oldRange.to <= otherChange.oldRange.to
                && change.newRange.from >= otherChange.newRange.from
                && change.newRange.to <= otherChange.newRange.to
        );
    });
    return filteredUniqueChanges;
  }
};
