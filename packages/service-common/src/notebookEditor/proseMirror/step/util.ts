import { Node as ProseMirrorNode} from 'prosemirror-model';
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
export type ChangedRange = { oldRange: SelectionRange; newRange: SelectionRange; }

// .. Util ........................................................................
/** remove duplicated ranges and ranges that are fully captured by other ranges */
export const simplifyChangedRanges = (changes: ChangedRange[]): ChangedRange[] => {
  const uniqueChanges = deduplicate(changes);

  if(uniqueChanges.length === 1) {
    return uniqueChanges;
  } else {
    const filteredUniqueChanges = uniqueChanges.filter((change, changeIndex) => {
        const remainingChanges = uniqueChanges.filter((remainingChanges, remainingChangeIndex) => remainingChangeIndex !== changeIndex);
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
