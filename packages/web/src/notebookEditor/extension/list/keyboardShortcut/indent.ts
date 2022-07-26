import { Fragment, Node as ProseMirrorNode, NodeRange, ResolvedPos, Slice } from 'prosemirror-model';
import { EditorState, TextSelection, Transaction } from 'prosemirror-state';

import { isListItemNode, AbstractDocumentUpdate, AttributeType, Command, ORDERED_LIST_DEFAULT_START } from '@ureeka-notebook/web-service';

import { isListNode } from '../util';
import { getListItemRange } from './util';

// ********************************************************************************
// NOTE: these inspired by https://github.com/remirror/remirror/blob/f274e22d8e89821d33f1166bf35b1b776986ae4f/packages/remirror__extension-list/src/list-commands.ts

/** increase the indentation level of the List at the current Selection */
export const indentListCommand: Command = (state, dispatch) => {
  const updatedTr = new IndentListDocumentUpdate().update(state, state.tr);
  if(updatedTr) {
    dispatch(updatedTr);
    return true/*Command executed*/;
  } /* else -- Command cannot be executed */

  return false/*not executed*/;
};
export class IndentListDocumentUpdate implements AbstractDocumentUpdate {
  public constructor() {/*nothing additional*/ }

  /**
   * modify the given Transaction such that the indentation of the
   * List at the current Selection is increased and return it
   */
   public update(editorState: EditorState, tr: Transaction) {
    const { $from, $to } = tr.selection;
    const range = getListItemRange(tr.selection);
    if(!range) return false/*no Range for ListItems found*/;

    const selectedList: ProseMirrorNode = tr.doc.resolve(range.start).node();
    if(!isListNode(selectedList)) return false/*Node at the Range start is not a List*/;

    const findPreviousListItemResult = findPreviousListItem(selectedList, $from, range);
    if(!findPreviousListItemResult) return false/*no previous ListItem found*/;

    const { previousListItem, previousList, previousListItemStart } = findPreviousListItemResult;
    const { selectedSlice, unselectedSlice } = sliceSelectedItems(tr.doc, $to, range);

    // make the selectedSlice inherit the styles of the unselected
    // Slice if it exists, so that the indented Items get the styles
    // of the List they are incorporating themselves into
    if(unselectedSlice && unselectedSlice.content.size > 0) {
      // get the first Item in the unselectedSlice
      let firstUnselectedItem: ProseMirrorNode | undefined = undefined/*default*/;
      unselectedSlice.content.descendants((descendant) => {
        if(firstUnselectedItem) return false/*already found*/;

        if((isListItemNode(descendant))) {
          firstUnselectedItem = descendant;
        } /* else -- ignore */

        return true/*keep looking*/;
      });

      selectedSlice.content.descendants((descendant) => {
        if(isListItemNode(descendant)) {
          descendant.attrs = {
            ...descendant.attrs,
            // ensure default styles for new ListItems
            [AttributeType.StartValue]: ORDERED_LIST_DEFAULT_START,
            [AttributeType.ListStyleType]: firstUnselectedItem?.attrs[AttributeType.ListStyleType],
          };
        } /* else -- ignore */
      });
    } else {
      // no unselectedSlice from which to take the styles, take them from the nearest ListItem above
      let nearestListItemAbove: ProseMirrorNode | undefined = undefined;
      previousListItem.descendants((descendant) => {
        if(isListItemNode(descendant)) {
          nearestListItemAbove = descendant;
        } /* else -- ignore */
      });
      selectedSlice.content.descendants((descendant) => {
        if(isListItemNode(descendant)) {
          descendant.attrs = {
            ...descendant.attrs,
            // ensure default styles for new ListItems
            [AttributeType.StartValue]: ORDERED_LIST_DEFAULT_START,
            [AttributeType.ListStyleType]: nearestListItemAbove?.attrs[AttributeType.ListStyleType],
          };
        } /* else -- ignore */
      });
    }

    const newCreatedList = selectedList.type.create(undefined/*do not inherit attrs*/, selectedSlice.content);
    const newPreviousListItemContent: Fragment = previousListItem.content
      .append(Fragment.fromArray([newCreatedList]))
      .append(unselectedSlice ? unselectedSlice.content : Fragment.empty);

    tr.deleteRange(range.start, range.end);

    const previousListItemEnd = previousListItemStart + previousListItem.nodeSize - 2/*account for start and end of Node*/,
          newPreviousListItem = previousListItem.copy(newPreviousListItemContent);
    newPreviousListItem.check();

    tr.replaceRangeWith(previousListItemStart - 1/*account for start*/, previousListItemEnd + 1/*account for end*/, newPreviousListItem)
      .setSelection(
        previousList === selectedList
          ? TextSelection.between(tr.doc.resolve($from.pos), tr.doc.resolve($to.pos))
          : TextSelection.between(tr.doc.resolve($from.pos - 2/*account for start and end*/), tr.doc.resolve($to.pos - 2/*account for start and end*/))
    ).scrollIntoView();

    return tr/*updated*/;
  }
}

// == Util ========================================================================
/**
 * try to find the previous ListItem, if any. Indentation will only be
 * performed if this ListItem is found. This ListItem may be in the same List
 * (i.e. previousListItem equals selectedList), or it may be the last ListItem
 * in the previous List
 */
const findPreviousListItem = (selectedList: ProseMirrorNode, $from: ResolvedPos, range: NodeRange) => {
  let previousListItem: ProseMirrorNode,
      previousListItemStart: number;

  let previousList: ProseMirrorNode,
      previousListStart: number;

  const doc = $from.doc;

  if(range.startIndex >= 1) {
    previousListItem = selectedList.child(range.startIndex - 1/*previous*/);
    previousList = selectedList;
    previousListStart = doc.resolve(range.start).start(range.depth);
    previousListItemStart = previousListStart + 1/*inside it*/;

    for(let i=0; i<range.startIndex - 1; i++) {
      previousListItemStart += previousList.child(i).nodeSize;
    }
  } else {
    const listIndex = $from.index(range.depth - 1);

    if(listIndex >= 1) {
      const listParent = $from.node(range.depth - 1/*its parent*/);
      const listParentStart = $from.start(range.depth - 1/*starting pos*/);
      previousList = listParent.child(listIndex - 1);
      if(!isListNode(previousList)) return false/*previous Node is not a List*/;

      previousListStart = listParentStart + 1;
      for(let i = 0; i < listIndex - 1; i++) {
        previousListStart += listParent.child(i).nodeSize;
      }

      previousListItem = previousList.child(previousList.childCount - 1/**account for 0 indexing*/);
      previousListItemStart = previousListStart + previousList.nodeSize - previousListItem.nodeSize - 1/*starting pos*/;

      if(!isListItemNode(previousListItem)) return false/*previous Node is not a ListItem*/;
    } else {
      return false/*cannot indent Node at this index*/;
    }
  }

  return { previousListItem, previousList, previousListItemStart, previousListStart };
};

/**
 * separate the selected ListItem into two Slices, selected and unselected.
 * If unselected Slice exists, do not change its indentation
 */
const sliceSelectedItems = (doc: ProseMirrorNode, $to: ResolvedPos, range: NodeRange) => {
  let selectedSlice: Slice;
  let unselectedSlice: Slice | null;
  const rangeStart = range.start;

  // `range.depth` is the depth of the List,
  // add 2 to it to get the depth of its ListItem children (e.g. ListItemContent)
  const middle = $to.depth >= range.depth + 2
              ? $to.end(range.depth + 2)
              : range.end - 1;
  const rangeEnd = range.end;

  if(middle + 1 >= rangeEnd) {
    selectedSlice = doc.slice(rangeStart, rangeEnd);
    unselectedSlice = null/*unselected Slice does not exist*/;
  } else {
    selectedSlice = doc.slice(rangeStart, middle);
    unselectedSlice = doc.slice(middle + 1, rangeEnd - 1);
  }

  return { selectedSlice, unselectedSlice };
};
