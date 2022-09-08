import { Fragment, Node as ProseMirrorNode, NodeType, NodeRange, Slice } from 'prosemirror-model';
import { Selection, Transaction, TextSelection } from 'prosemirror-state';

import { isListNode } from '../util';

// ********************************************************************************
// -- Wrap ------------------------------------------------------------------------
/**
 * wrap the existing ListItems into a List of a new type, which only
 * contains these ListItems.
 */
export const wrapSelectedItems = (listType: NodeType, listItemType: NodeType, tr: Transaction) => {
  const range = getListItemRange(tr.selection);
  if(!range) return false/*no Range for ListItems found*/;

  const atStart = range.startIndex === 0/*start*/;
  const { from, to } = tr.selection;

  if(!wrapItems(listType, listItemType, tr, range )) {
    return false/*could not wrap*/;
  } /* else -- valid wrapping, Transaction has been updated */

  tr.setSelection(TextSelection.between( tr.doc.resolve(atStart ? from : from + 2), tr.doc.resolve(atStart ? to : to + 2)))
    .scrollIntoView();

  return tr/*updated*/;
};
/**
 * modify the given Transaction such that ListItems in the given Range
 * are wrapped into a List of the given type
 */
const wrapItems = (listType: NodeType, listItemType: NodeType, tr: Transaction, range: NodeRange): boolean => {
  const oldList = range.parent;

  // create a Slice containing all selected ListItems
  const slice: Slice = tr.doc.slice(range.start, range.end);
  if(oldList.type === listType && slice.content.firstChild?.type === listItemType) return false/*same structure, no need to wrap*/;

  // create a new List containing all ListItems from the Slice
  const newItems: ProseMirrorNode[] = [];
  for(let i = 0; i < slice.content.childCount; i++) {
    const oldItem = slice.content.child(i);
    if(!listItemType.validContent(oldItem.content)) return false/*not a valid content for the new ListItem type, do not wrap*/;

    const newItem = listItemType.createChecked(undefined/*no attrs*/, oldItem.content);
    newItems.push(newItem);
  }

  // replace the Range
  const newList = listType.createChecked(undefined/*no attrs*/, newItems);
  tr.replaceRange(range.start, range.end, new Slice(Fragment.from(newList), 0, 0));

  return true/*Transaction updated, wrapping successful*/;
};

// -- Range -----------------------------------------------------------------------
/** return a Range including all selected ListItems */
export const getListItemRange = (selection: Selection): NodeRange | null | undefined => {
  const { $from, $to } = selection;
  return $from.blockRange($to, isListNode);
};
