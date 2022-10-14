import { Transaction } from 'prosemirror-state';
import { Step as ProseMirrorStep, Step, Transform } from 'prosemirror-transform';

import { NotebookVersionContent } from '../../type';
import { SelectionRange } from '../command';
import { ChangedRange, simplifyChangedRanges } from './util';

// ********************************************************************************
// == JSON ========================================================================
/** JSON representation of a ProseMirror Step */
// NOTE: opaque at this time
export type JSONStep = { [key: string]: any; };

// NOTE: NotebookVersionContent is a synonym for 'StepContent' (which wasn't explicitly
//       defined as it would be redundant)

export const stepToJSONStep = (step: ProseMirrorStep) => step.toJSON() as JSONStep;
export const contentToJSONStep = (content: NotebookVersionContent) => JSON.parse(content) as JSONStep;/*FIXME: handle exceptions!!!*/

// == Util ========================================================================
// -- Step ------------------------------------------------------------------------
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
export const mapOldStartAndOldEndThroughHistory = (transaction: Transaction, stepMapIndex: number, unmappedOldStart: number, unmappedOldEnd: number) => {
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


// -- Change ----------------------------------------------------------------------
// NOTE: not in a separate file since Changes take Steps into account
/**
 * Returns a list of changed ranges
 * based on the first and last state of all steps.
 */
 export const getChangedRanges =(transform: Transform): ChangedRange[] => {
  const { mapping, steps } = transform;
  const changes: ChangedRange[] = [/*default empty*/];

  mapping.maps.forEach((stepMap, index) => {
    const ranges: SelectionRange[] = [];

    // NOTE: need to account for Step changes where no Range was altered
    //       (e.g. setting a Mark, Node Attribute, etc)
    // NOTE: @ts-ignore is to access needed information in the StepMap that is marked
    //       as private, in order to ensure the requirements of the NOTE above
    // @ts-ignore
    if(!stepMap.ranges.length) {
      const { from, to } = steps[index] as Step & { from?: number; to?: number; };
      if(from === undefined/*explicit check since it can be 0*/ || to === undefined/*explicit check since it can be 0*/) return/*nothing to do*/;
      ranges.push({ from, to });
    } else {
      stepMap.forEach((from, to) => ranges.push({ from, to }));
    }

    ranges.forEach(({ from, to }) => {
      const newStart = mapping.slice(index).map(from, -1/*associate to position to the left*/),
            newEnd = mapping.slice(index).map(to);
      const oldStart = mapping.invert().map(newStart, -1/*associate to position to the left*/),
            oldEnd = mapping.invert().map(newEnd);
      changes.push({ oldRange: { from: oldStart, to: oldEnd }, newRange: { from: newStart, to: newEnd } });
    });
  });

  return simplifyChangedRanges(changes);
};
