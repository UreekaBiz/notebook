import { Fragment, Node as ProseMirrorNode, NodeType } from 'prosemirror-model';
import { EditorState, Selection, TextSelection, Transaction } from 'prosemirror-state';

import { findParentNode, Command, NodeName, AbstractDocumentUpdate, ParentNodePosition } from '@ureeka-notebook/web-service';

import { isListNode } from '../util';
import { LiftListItemOutOfListDocumentUpdate } from './liftListItemOutOfListCommand';
import { WrapInListDocumentUpdate } from './proseMirrorListCommands';

// ********************************************************************************
// NOTE: this is inspired by https://github.com/remirror/remirror/blob/f274e22d8e89821d33f1166bf35b1b776986ae4f/packages/remirror__extension-list/src/list-commands.ts

/**
 * toggle between List types. If startingAnchor is passed, it will be set
 * as the starting point for the Selection before the Command is executed
 */
export const toggleListCommand = (listNodeName: NodeName.BULLET_LIST | NodeName.ORDERED_LIST | NodeName.TASK_LIST, startingAnchor?: number): Command => (state, dispatch) => {
  const updatedTr = new ToggleListDocumentUpdate(listNodeName).update(state, state.tr);
  if(updatedTr) {
    dispatch(updatedTr);
    return true/*Command executed*/;
  } /* else -- Command cannot be executed */

  return false/*not executed*/;
};
export class ToggleListDocumentUpdate implements AbstractDocumentUpdate {
  public constructor(private readonly listNodeName: NodeName.BULLET_LIST | NodeName.ORDERED_LIST | NodeName.TASK_LIST, private readonly startingAnchor?: number) {/*nothing additional*/ }

  /**
   * modify the given Transaction such that the List types at the Selection
   * are toggled if possible, and return it. If startingAnchor is given,
   * it will be set as the starting point for the Selection before any
   * other Transaction update
   */
  public update(editorState: EditorState, tr: Transaction) {
    // -- Setup -------------------------------------------------------------------
    // the original anchor, where the User currently is
    const originalAnchor = tr.selection.anchor;

    // if startingAnchor was passed, then that means this execution call comes
    // from a ToolItem. The following Transaction Updates will act as if the User
    // had set the anchor there before making other changes
    if(this.startingAnchor) {
      tr.setSelection(TextSelection.create(tr.doc, this.startingAnchor));
    } /* else -- use originalAnchor as the startingAnchor (default) */

    const { $from, $to } = tr.selection;
    const range = $from.blockRange($to);
    if(!range) return false/*no blockRange in current Selection*/;

    const listItemTypeName = this.listNodeName === NodeName.TASK_LIST ? NodeName.TASK_LIST_ITEM : NodeName.LIST_ITEM;
    const listType = editorState.schema.nodes[this.listNodeName],
          listItemType = editorState.schema.nodes[listItemTypeName];

    // -- check for Toggle, List Type Change or Deep List Type Change -------------
    const parentList = findParentNode({ predicate: (node: ProseMirrorNode) => isListNode(node), lookInsideOf: tr.selection });
    if(parentList && range.depth - parentList.depth <= 1/*the Selection range is inside the List*/ && range.startIndex === 0/*the Selection range is the first child of the list*/) {
      if(parentList.node.type === listType) {
        const liftedListUpdatedTr = new LiftListItemOutOfListDocumentUpdate(listItemTypeName).update(editorState, tr);
        if(liftedListUpdatedTr) {
          // since lifting, unlike swapping the ListType, performing a deepChange
          // or Wrapping can reduce the size of the Document, the check for a
          // valid final anchor has to be performed. This specifically covers
          // the case where a List is toggled and it is the only child of
          // the Document
          let newFinalAnchor = originalAnchor/*default*/;
          if(liftedListUpdatedTr.doc.nodeSize - originalAnchor <= 1/*(SEE: comment above)*/) {
            newFinalAnchor = liftedListUpdatedTr.doc.nodeSize - 2/*account for start and end of Doc*/;
          } /* else -- do not change default */

          return liftedListUpdatedTr.setSelection(Selection.near(liftedListUpdatedTr.doc.resolve(newFinalAnchor), -1/*look backwards first*/))/*updated*/;
        } /* else -- unable to lift List */
        return false/*could not lift List*/;
      } /* else -- not toggling a List */

      // ..........................................................................
      if(isListNode(parentList.node)) {
        if(listType.validContent(parentList.node.content)) {
          return tr.setNodeMarkup(parentList.posBeforeNode, listType);
            // .setSelection(Selection.near(tr.doc.resolve(originalAnchor)))/*updated*/;
        } /* else -- swap between BulletList/OrderedList to TaskList */

        // ..........................................................................
        const deepChangeUpdatedTr = deepChangeListType(tr, parentList, listType, listItemType);
        if(deepChangeUpdatedTr) {
          return deepChangeUpdatedTr.setSelection(Selection.near(deepChangeUpdatedTr.doc.resolve(originalAnchor)))
                             .scrollIntoView()/*updated*/;
        } /* else -- command cannot be executed */
        return false/*not executed*/;
      } /* else -- parent is not a List, do nothing */
    } /* else -- Selection range is not inside a List or is not its first child*/

    // -- else -- Wrap ------------------------------------------------------------
    const updatedTr = new WrapInListDocumentUpdate(listType).update(editorState, tr);
    if(updatedTr) {
      return updatedTr.setSelection(Selection.near(updatedTr.doc.resolve(originalAnchor)))/*updated*/;
    } /* else -- unable to wrap List */
    return false/*could not wrap List*/;
  }
}

// == Util ========================================================================
/**
 * check if a BulletList / OrderedList can be changed into a TaskList or
 * vice versa and return the modified Transaction if it is the case
 */
 export const deepChangeListType = (tr: Transaction, foundList: ParentNodePosition, listNodeType: NodeType, listItemNodeType: NodeType) => {
  // -- Setup ---------------------------------------------------------------------
  const oldList = foundList.node;
  const nodeStart = tr.doc.resolve(foundList.nodeStart);
  const listParent = nodeStart.node(-1/*top level*/);
  const indexBefore = nodeStart.index(-1/*top level*/);

  if(!listParent) return false/*Parent does not exist*/;
  if(!listParent.canReplace(indexBefore, indexBefore + 1, Fragment.from(listNodeType.create()))) return false/*invalid state after replacement*/;

  // -- New List Creation ---------------------------------------------------------
  const newListItems: ProseMirrorNode[] = [];
  for(let index = 0; index < oldList.childCount; index++) {
    const oldListItem = oldList.child(index);
    if(!listItemNodeType.validContent(oldListItem.content)) return false/*resulting state has invalid content*/;

    const newItem = listItemNodeType.createChecked(null, oldListItem.content);
    newListItems.push(newItem);
  }
  const newList = listNodeType.createChecked(null/*no attrs specified*/, newListItems);
  const replacedRangeStart = foundList.posBeforeNode;
  const replacedRangeEnd = replacedRangeStart + oldList.nodeSize;
  const { from } = tr.selection;

  // -- Replacement ---------------------------------------------------------------
  tr.replaceRangeWith(replacedRangeStart, replacedRangeEnd, newList)
    .setSelection(Selection.near(tr.doc.resolve(from)));

  return tr/*updated*/;
};
