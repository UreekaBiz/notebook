import { EditorState, TextSelection, Transaction } from 'prosemirror-state';

import { createStrikethroughMark, getStrikethroughMarkType, AbstractDocumentUpdate, AttributeType, Command } from '@ureeka-notebook/web-service';

// ********************************************************************************
/**
 * apply or remove the Strikethrough Mark to the contents of the
 * clicked TaskListItem depending on whether checked is true or false
 */
export const crossTaskListItemCommand = (taskListItemPos: number, checked: boolean): Command => (state, dispatch) => {
  const updateResult = new CrossTaskListItemDocumentUpdate(taskListItemPos, checked).update(state, state.tr);
  if(updateResult) {
    dispatch(updateResult);
    return true/*Command executed*/;
  } /* else -- Command cannot be executed */

  return false/*not executed*/;
};
export class CrossTaskListItemDocumentUpdate implements AbstractDocumentUpdate {
  public constructor(private readonly taskListItemPos: number, private readonly checked: boolean) {/*nothing additional*/}

  /**
   * modify the given Transaction such that the Strikethrough Mark is applied
   * to the contents of the clicked TaskListItem depending on whether checked
   * is true or false
   */
  public update(editorState: EditorState, tr: Transaction) {
    const currentNode = tr.doc.nodeAt(this.taskListItemPos);
    if(!currentNode) return false/*Node does not exist*/;

    // NOTE: only on firstChild so that the content of other nested
    //       TaskListItems do not receive the Strikethrough Mark
    const { firstChild } = currentNode;
    if(!firstChild) return false/*first child does not exist*/;
    // update the attributes and set the corresponding marks based on the
    // checked value
    const { pos: startingAnchor } = tr.selection.$anchor,
          { pos: startingHead } = tr.selection.$head;

    if(this.checked) {
      tr.setNodeMarkup(this.taskListItemPos, undefined/*maintain type*/, { ...currentNode.attrs, [AttributeType.Checked]: this.checked })
        .addMark(this.taskListItemPos + 1/*inside the node*/,
                 this.taskListItemPos + firstChild.nodeSize,
                 createStrikethroughMark(editorState.schema))
        .setSelection(TextSelection.create(tr.doc, startingAnchor, startingHead));
    } else {
      tr.setNodeMarkup(this.taskListItemPos, undefined/*maintain type*/, { ...currentNode.attrs, [AttributeType.Checked]: this.checked })
        .removeMark(this.taskListItemPos + 1/*inside the node*/,
                    this.taskListItemPos + firstChild.nodeSize,
                    getStrikethroughMarkType(editorState.schema)/*only remove the Strikethrough Mark*/)
        .setSelection(TextSelection.create(tr.doc, startingAnchor, startingHead));
    }
    return tr/*updated*/;
  }
}
