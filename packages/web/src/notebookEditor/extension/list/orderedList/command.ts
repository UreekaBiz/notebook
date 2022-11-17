import { EditorState, Transaction } from 'prosemirror-state';

import { getListItemNodeType, getOrderedListNodeType, isListItemNode, AbstractDocumentUpdate, Command, ListItemAttributes, OrderedListNodeType, OrderedListAttributes } from '@ureeka-notebook/web-service';

// ********************************************************************************
// modify the attributes of the OrderedList at the given position
export const updateOrderedListCommand = (orderedListPosition: number, attributes: Partial<OrderedListAttributes>): Command => (state, dispatch) => {
  const updatedTr = new UpdateOrderedListDocumentUpdate(orderedListPosition, attributes).update(state, state.tr);
  if(updatedTr) {
    dispatch(updatedTr);
    return true/*Command executed*/;
  } /* else -- Command cannot be executed */

  return false/*not executed*/;
};
export class UpdateOrderedListDocumentUpdate implements AbstractDocumentUpdate {
  public constructor(private readonly orderedListPosition: number, private readonly attributes: Partial<OrderedListAttributes>) {/*nothing additional*/}

  /**
   * modify the given Transaction such that the attributes of the OrderedList
   * at the given position are modified
   */
  public update(editorState: EditorState, tr: Transaction) {
    tr.setNodeMarkup(this.orderedListPosition, getOrderedListNodeType(editorState.schema), { ...this.attributes });
    return tr/*updated*/;
  }
}

// --------------------------------------------------------------------------------
// update the attributes of all ListItem children of the given OrderedList
export const updateListItemsInOrderedListCommand = (parentOrderedList: OrderedListNodeType, orderedListPosition: number, attributes: Partial<ListItemAttributes>): Command => (state, dispatch) => {
  const updatedTr = new UpdateListItemsInOrderedListDocumentUpdate(parentOrderedList, orderedListPosition, attributes).update(state, state.tr);
  if(updatedTr) {
    dispatch(updatedTr);
    return true/*Command executed*/;
  } /* else -- Command cannot be executed */

  return false/*not executed*/;
};
export class UpdateListItemsInOrderedListDocumentUpdate implements AbstractDocumentUpdate {
  public constructor(private readonly parentOrderedList: OrderedListNodeType, private readonly orderedListPosition: number, private readonly attributes: Partial<ListItemAttributes>) {/*nothing additional*/}

  /**
   * modify the given Transaction such that all ListItem children of the
   * given OrderedList get their attributes updated
   */
  public update(editorState: EditorState, tr: Transaction) {
    const from = this.orderedListPosition,
          to = this.orderedListPosition + this.parentOrderedList.nodeSize;

    tr.doc.nodesBetween(from, to, (node, pos, parent) => {
      // NOTE: since nodesBetween returns all parent Nodes for Nodes
      //       in between the given Range, check that the pos is
      //       in the Range for ListItems that are to be updated
      if(isListItemNode(node)
       && (pos >= from && pos <= to/*(SEE: NOTE above)*/)
       && parent === this.parentOrderedList/*ensure only the immediate ListNodes are updated*/
      ) {
        tr.setNodeMarkup(pos, getListItemNodeType(editorState.schema), { ...node.attrs, ...this.attributes });
      } /* else -- do not modify */
    });

    return tr/*updated*/;
  }
}
