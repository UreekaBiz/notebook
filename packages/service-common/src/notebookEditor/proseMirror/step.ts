import { Transaction } from 'prosemirror-state';

import { NotebookSchemaType } from './schema';

// ********************************************************************************
/**
 * @param transaction The transactions whose steps are being mapped
 * @param stepMapIndex The stepMapIndex of the step that is currently being mapped
 * @param unmappedOldStart The step's default (therefore non-mapped) oldStart
 * @param unmappedOldEnd The step's default (therefore non-mapped) oldEnd
 * @returns The mappedOldStart, mappedOldEnd, mappedNewStart and mappedNewEnd
 *          that take into account undo and redo by mapping through the right
 *          newStart and newEnd, which are calculated up to the corresponding
 *          stepMapIndex
 */
// REF: https://discuss.prosemirror.net/t/how-to-calculate-the-changed-ranges-for-transactions/3771/3
export const mapOldStartAndOldEndThroughHistory = (transaction: Transaction<NotebookSchemaType>, stepMapIndex: number, unmappedOldStart: number, unmappedOldEnd: number) => {
  // To ensure every step computes the right positions for oldStart, oldEnd,
  // newStart and newEnd regardless of whether something was done or undone
  // in the history, map the unmappedOldStart and unmappedOldEnd forward
  // through the corresponding stepMapIndex to get the real newStart and newEnd up
  // until that stepMapIndex, associating to the corresponding positions.
  // Then compute the right oldStart and oldEnd by inverting and mapping
  // using the right newStart and newEnd

  // map oldStart and oldEnd starting on the current stepMapIndex
  const mappedNewStart = transaction.mapping.slice(stepMapIndex).map(unmappedOldStart, -1/*associate position to the left since its start*/),
        mappedNewEnd = transaction.mapping.slice(stepMapIndex).map(unmappedOldEnd);

  // compute the correct oldStart and oldEnd inverting and mapping through the the mapped newStart and newEnd
  const mappedOldStart = transaction.mapping.invert().map(mappedNewStart, -1/*associate position to the left since its start*/),
        mappedOldEnd = transaction.mapping.invert().map(mappedNewEnd);

  return { mappedOldStart, mappedOldEnd, mappedNewStart, mappedNewEnd };
};
