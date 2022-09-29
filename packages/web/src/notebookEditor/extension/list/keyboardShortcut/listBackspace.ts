import { EditorState, TextSelection, Transaction } from 'prosemirror-state';

import { isListItemNode, AbstractDocumentUpdate, Command, JoinBackwardDocumentUpdate } from '@ureeka-notebook/web-service';

import { LiftListItemDocumentUpdate } from '../command/proseMirrorListCommands';
import { isListNode } from '../util';
import { wrapSelectedItems } from './util';

// ********************************************************************************
/** handle Backspace behavior when the Selection is inside a ListItemContent Node */
export const listBackspaceCommand: Command = (state, dispatch) => {
  const updatedTr = new ListBackSpaceDocumentUpdate().update(state, state.tr);
  if(updatedTr) {
    dispatch(updatedTr);
    return true/*Command executed*/;
  } /* else -- Command cannot be executed */

  return false/*not executed*/;
};
export class ListBackSpaceDocumentUpdate implements AbstractDocumentUpdate {
  public constructor() {/*nothing additional*/ }

  /**
   * modify the given Transaction such that Backspace behavior is
   * handled correctly when the Selection is inside a
   * ListItemContent Node and return it
   */
  public update(editorState: EditorState, tr: Transaction) {
    const $cursor = (editorState.selection as TextSelection/*specifically looking for $cursor*/).$cursor;
    if(!$cursor || $cursor.parentOffset > 0/*ListItemContent has content*/) return false/*nothing special to do*/;

    const range = $cursor.blockRange();
    if(!range || !isListItemNode(range.parent) || range.startIndex !== 0) return false/*nothing special to do*/;

    const wrapListBackwardUpdatedTr = wrapListBackward(tr);
    if(wrapListBackwardUpdatedTr) {
      return wrapListBackwardUpdatedTr/*updated, types of Lists swapped*/;
    } /* else -- command cannot be executed */

    // specific case: backspace in three-levels List
    // * A
    //   * <cursor>B
    //     * C
    const listItemIndex = $cursor.index(range.depth/*n-th Node in ListItem*/);
    const listIndex = $cursor.index(range.depth - 1/*n-th ListItem in List*/);
    const rootIndex = $cursor.index(range.depth - 2/*n-th List in its parent*/);
    const isNestedList = range.depth - 2 >= 1/*not top level*/ && isListItemNode($cursor.node(range.depth - 2/*List wraps ListItem, which wraps ListItemContent*/));

    if(listItemIndex === 0 && listIndex === 0 && rootIndex <= 1 && isNestedList) {
      return new LiftListItemDocumentUpdate(range.parent.type).update(editorState, tr)/*updated*/;
    } /* else -- join backward */

    const joinBackwardUpdatedTr = new JoinBackwardDocumentUpdate().update(editorState, tr);
    return joinBackwardUpdatedTr/*updated*/;
  }
}

// == Util ========================================================================
/**
 * modify the given Transaction to wrap the selected ListItems
 * such that they fit according to the ListType in the previous List
 */
const wrapListBackward = (tr: Transaction) => {
  const $cursor = tr.selection.$from;
  const range = $cursor.blockRange();
  if(!range || !isListItemNode(range.parent) || range.startIndex !== 0) return false/*nothing special to do*/;

  const root = $cursor.node(range.depth - 2/*the Node containing the List*/);
  const rootIndex = $cursor.index(range.depth - 2/*n-th List in root*/);
  const listItemIndex = $cursor.index(range.depth/*n-th Node in ListItem*/);
  const listIndex = $cursor.index(range.depth - 1/*n-th ListItem in List*/);

  // get the previous List and its last ListItem
  const previousList = root.maybeChild(rootIndex - 1);
  const previousListItem = previousList?.lastChild;
  if( listItemIndex !== 0/*current Node is not the first Node in its parent ListItem*/
   || listIndex !== 0/*current ListItem is not the first ListItem in its parent List*/
  ) return false/*do not wrap*/;

  if( previousList/*there is a Node before the current List*/
   && isListNode(previousList)/*said Node is a List*/
   && previousListItem /*said List has a Node as its lastChild*/
   && isListItemNode(previousListItem)/* said lastChild is a ListItem*/
  ) {
    return wrapSelectedItems(previousList.type, previousListItem.type, tr);
  } /* else -- one of the conditions above does not hold, check if root is ListItem */

  if(isListItemNode(root)) {
    const parentListItem = root;
    const parentOfList = $cursor.node(range.depth - 3/*parent of the Node containing the List*/);

    if(isListNode(parentOfList)) {
      return wrapSelectedItems(parentOfList.type, parentListItem.type, tr);
    } /* else -- parent of List is not a List Node, do nothing */
  } /* root is not a ListItem, cannot wrap*/

  return false/*do not wrap*/;
};
