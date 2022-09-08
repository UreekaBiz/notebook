import { Editor } from '@tiptap/core';
import { EditorState, Transaction } from 'prosemirror-state';

import { getBlockNodeRange, getListItemContentNodeType, isListItemContentNode, isDocumentNode, AbstractDocumentUpdate, LiftEmptyBlockNodeDocumentUpdate, NotebookSchemaType } from '@ureeka-notebook/web-service';

import { applyDocumentUpdates } from 'notebookEditor/command/update';
import { SetParagraphDocumentUpdate } from 'notebookEditor/extension/paragraph/command';

// ********************************************************************************
// === Update =====================================================================
// -- Setter ----------------------------------------------------------------------
// NOTE:  since ListItemContent Nodes are not allowed to be a direct child of the
//        Document Node (by convention, not by schema), set this property of
//        on the Transaction to disable the plugin that enforces this for this
//        particular transaction (SEE: NOTE below)
export const ALLOW_LIST_ITEM_CONTENT_META = 'allowListItem';

// NOTE:  ListItemContent does not have a Command since the
//        SetListItemContentDocumentUpdate should only be used to create a
//        Transaction whose document is in the intermediate state of
//        turning into a List (since these type of Block should not be a direct
//        child of the Document (by convention, i.e. no errors would happen)).
//        As such it is meant to be used only be other DocumentUpdates or by
//        the applyDocumentUpdates function
export class SetListItemContentDocumentUpdate implements AbstractDocumentUpdate {
  public constructor() {/*nothing additional*/}

  /**
   * Modify the given Transaction such that the current Block becomes a
   * ListItemContent Node and return it (SEE: NOTE above)
   */
  public update(editorState: EditorState<NotebookSchemaType>, tr: Transaction<NotebookSchemaType>) {
    if(tr.selection.empty && isListItemContentNode(tr.selection.$anchor.parent)) {
      return tr/*already in ListItemContent*/;
    } /* else -- set ListItemContent */

    const { from, to } = getBlockNodeRange(tr.selection);
    tr.setBlockType(from, to, getListItemContentNodeType(editorState.schema))
      .setMeta(ALLOW_LIST_ITEM_CONTENT_META, true/*(SEE: NOTE above)*/);

    return tr/*updated*/;
  }
}

// -- Lift ------------------------------------------------------------------------
// ensure that whenever an empty ListItemContent Node which is a direct child of
// the Document, with only a single ListItem (and hence a single ListItemContent)
// that is empty, the default behavior of pressing Enter or Backspace is maintained
export const liftEmptyListItemContent = (editor: Editor): boolean => {
  const { $anchor, empty } = editor.state.selection;
  const { parent } = $anchor;

  if(empty && isListItemContentNode(parent/*guaranteed to be same parent as head by previous check*/) &&
    $anchor.depth === 3/*child of ListItem inside List Node*/ &&
    isDocumentNode($anchor.node(-3/*parent of Grandparent List*/)) &&
    parent.content.size < 1/*ListItemContent Node is empty*/
  ) {
    return applyDocumentUpdates(editor, [ new LiftEmptyBlockNodeDocumentUpdate(), new SetParagraphDocumentUpdate() ]);
  } /* else -- not inside an empty ListItemContent that should become a Paragraph */

  return false/*let PM handle the event*/;
};
