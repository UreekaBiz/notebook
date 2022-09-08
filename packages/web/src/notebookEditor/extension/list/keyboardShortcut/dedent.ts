import { Fragment, Node as ProseMirrorNode, NodeRange, ResolvedPos, Slice } from 'prosemirror-model';
import { EditorState, Transaction } from 'prosemirror-state';
import { liftTarget, ReplaceAroundStep } from 'prosemirror-transform';

import { isListItemNode, AbstractDocumentUpdate, Command, NotebookSchemaType } from '@ureeka-notebook/web-service';

import { isListNode, maybeJoinList } from '../util';
import { getListItemRange, wrapSelectedItems } from './util';

// ********************************************************************************
/** decrease the indentation of the List at the current Selection */
export const dedentListCommand: Command = (state, dispatch) => {
  const updatedTr = new DedentListDocumentUpdate().update(state, state.tr);
  if(updatedTr) {
    dispatch(updatedTr);
    return true/*Command executed*/;
  } /* else -- Command cannot be executed */

  return false/*not executed*/;
};
export class DedentListDocumentUpdate implements AbstractDocumentUpdate {
  public constructor() {/*nothing additional*/ }

  /**
   * modify the given Transaction such that the indentation level of the
   * List at the current Selection is decreased and return it
   */
  public update(editorState: EditorState<NotebookSchemaType>, tr: Transaction<NotebookSchemaType>) {
    let range = getListItemRange(tr.selection);
    if(!range) return false/*no Range for ListItems found*/;

    const findParentListItemResult = findParentListItem(tr.selection.$from, range);
    if(!findParentListItemResult) return false/*no parent ListItem found*/;
    const { parentListItem, grandParentList } = findParentListItemResult;

    // update Transaction with new ListItems and Nodes,
    // update Range accordingly, check if lifting can be done after
    // the Range has been updated
    range = indentSiblingsOfListItems(tr, range);
    range = indentSiblingsOfList(tr, range);
    range = changeListItemsType(tr, range, grandParentList, parentListItem);

    const target = liftTarget(range);
    if(typeof target !== 'number'/*explicit check since depth can be 0*/) return false/*no target Depth to which the Content in Range can be lifted found*/;

    // lift and update Range accordingly, check if List needs to be joined
    tr.lift(range, target);
    range = getListItemRange(tr.selection);
    if(range) {
      maybeJoinList(tr, tr.doc.resolve(range.end - 2));
    } /* else -- new Range not found, just return the updated Transaction thus far  */

    return tr/*updated*/;
  }
}

// == Util ========================================================================
/**
 * find $from's parent ListItem and its grand parent List given itself and a range
 */
const findParentListItem = ($from: ResolvedPos, range: NodeRange) => {
  const parentListItem = $from.node(range.depth - 1/*direct parent*/);
  const grandParentList = $from.node(range.depth - 2/*parent of direct parent*/);

  if(!isListItemNode(parentListItem) || !isListNode(grandParentList)) return false/*not a valid List structure*/;

  return { parentListItem, grandParentList };
};

/**
 * modify the given Transaction such that any sibling ListItems
 * after the selected ones become children of the last one, returning
 * a new Range that accounts for these changes
 */
const indentSiblingsOfListItems = (tr: Transaction, range: NodeRange): NodeRange => {
  const selectedList = range.parent;
  const lastSelectedItem = range.parent.child(range.endIndex - 1);

  const endOfRange = range.end;
  const endOfSelectedList = range.$to.end(range.depth);

  if(endOfRange < endOfSelectedList) {
    // there are sibling ListItems after the selected ListItems, which must become
    // children of the last ListItem
    tr.step(
      new ReplaceAroundStep(
        endOfRange - 1,
        endOfSelectedList,
        endOfRange,
        endOfSelectedList,
        new Slice(Fragment.from(lastSelectedItem.type.create(null, selectedList.copy())), 1, 0), 1, true/*maintain structure*/)
    );
    return new NodeRange(
      tr.doc.resolve(range.$from.pos),
      tr.doc.resolve(endOfSelectedList),
      range.depth
    );
  }

  return range/*modified*/;
};

/**
 * modify the given Transaction such that any sibling Nodes
 * after the selected List become children of the ListItem, returning
 * a new Range that accounts for these changes
 */
const indentSiblingsOfList = (tr: Transaction, range: NodeRange): NodeRange => {
  const selectedList = range.parent;
  const lastSelectedItem = range.parent.child(range.endIndex - 1);

  const endOfSelectedList = range.end;
  const endOfParentListItem = range.$to.end(range.depth - 1);

  if(endOfSelectedList + 1 < endOfParentListItem) {
    // there are sibling nodes after the selected List, which must become
    // children of the last ListItem
    tr.step(
      new ReplaceAroundStep(
        endOfSelectedList - 1,
        endOfParentListItem,
        endOfSelectedList + 1,
        endOfParentListItem,
        new Slice(Fragment.from(selectedList.type.create(null, lastSelectedItem.type.create(null))), 2, 0), 0, true/*maintain structure*/)
    );
    return new NodeRange(tr.selection.$from, tr.selection.$to, range.depth);
  }

  return range/*updated*/;
};

/**
 * modify the given Transaction such that the ListItems inside
 * the given parentList change their type, if they need to, and return a
 * new Range that accounts for these changes
 */
 const changeListItemsType = (tr: Transaction, range: NodeRange, parentList: ProseMirrorNode, parentListItem: ProseMirrorNode) => {
  const wrapped = wrapSelectedItems(parentList.type, parentListItem.type, tr);
  if(wrapped) {
    return new NodeRange(tr.selection.$from, tr.selection.$to, range.depth);
  } /* else -- could not wrap, do not change range */

  return range/*not changed*/;
};