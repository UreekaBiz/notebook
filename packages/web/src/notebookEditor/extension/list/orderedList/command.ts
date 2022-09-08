import { EditorState, Transaction } from 'prosemirror-state';

import { getListItemNodeType, isListItemNode, AbstractDocumentUpdate, Command, ListItemAttributes, NotebookSchemaType, OrderedListNodeType } from '@ureeka-notebook/web-service';

// ********************************************************************************
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
   * closest OrderedList get their attributes updated
   */
  public update(editorState: EditorState<NotebookSchemaType>, tr: Transaction<NotebookSchemaType>) {
    const from = this.orderedListPosition,
          to = this.orderedListPosition + this.parentOrderedList.nodeSize;

    tr.doc.nodesBetween(from, to, (node, pos, parent) => {
      // NOTE: since nodesBetween returns all parent Nodes for Nodes
      //       in between the given Range, check that the pos is
      //       in the Range for ListItems that are to be updated
      if(isListItemNode(node) &&
        (pos >= from && pos <= to/*(SEE: NOTE above)*/) &&
        parent === this.parentOrderedList/*ensure only the immediate ListNodes are updated*/
      ) {
        tr.setNodeMarkup(pos, getListItemNodeType(editorState.schema), { ...node.attrs, ...this.attributes });
      } /* else -- do not modify */
    });

    return tr/*updated*/;
  }
}
