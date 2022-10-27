import { EditorState, NodeSelection, Selection, Transaction } from 'prosemirror-state';

import { createHorizontalRuleNode, createParagraphNode, getBlockNodeRange, isHorizontalRuleNode, isNodeSelection, AbstractDocumentUpdate, Command, CreateBlockNodeDocumentUpdate, NodeName } from '@ureeka-notebook/web-service';

// ********************************************************************************
// insert and select an HorizontalRule or toggle it if the current Selection is a
// NodeSelection and it contains an HorizontalRule Node
export const insertOrToggleHorizontalRuleCommand: Command = (state, dispatch) => {
  const updatedTr = new InsertOrToggleHorizontalRuleDocumentUpdate().update(state, state.tr);
  if(updatedTr) {
    dispatch(updatedTr);
    return true/*Command executed*/;
  } /* else -- Command cannot be executed */

  return false/*not executed*/;
};
export class InsertOrToggleHorizontalRuleDocumentUpdate implements AbstractDocumentUpdate {
  public constructor() {/*nothing additional*/}

  /**
   * Modify the given Transaction such that a HorizontalRule is inserted and
   * selected, or toggled if the current Selection is a NodeSelection and it
   * contains an HorizontalRule Node
   */
  public update(editorState: EditorState, tr: Transaction) {
    const { selection } = tr;
    const { $from, from } = selection;

    if(isNodeSelection(selection) && isHorizontalRuleNode(selection.node)) {
      tr.replaceSelectionWith(createParagraphNode(editorState.schema))
        .setSelection(Selection.near(tr.doc.resolve(from), 1/*look forwards first*/));
      return tr/*updated*/;
    } /* else -- insert and select HorizontalRule */

    const { empty } = selection;
    if(!empty) return false/*do not allow if Selection is not empty*/;
    if(!($from.parent.isTextblock)) return false/*cannot transform into HorizontalRule*/;

    const updatedTr = new CreateBlockNodeDocumentUpdate(NodeName.PARAGRAPH, {/*no attrs*/}).update(editorState, tr);
    if(!updatedTr) return false/*could not create Paragraph below*/;

    const { from: paragraphStart, to: paragraphEnd } = getBlockNodeRange(updatedTr.selection);
    updatedTr.replaceRangeWith(paragraphStart, paragraphEnd, createHorizontalRuleNode(editorState.schema));

    try {
      // look for the place where ProseMirror inserted the HorizontalRule
      // in the Range around the replaced Paragraph. This has to be done to ensure
      // the right Selection is set, taking into account the cases where the inserted
      // Node is at the start of the Document, its end, and in between other Blocks
      let horizontalRulePos = -1/*default*/,
          horizontalRuleFound = false/*default*/;
      const rangeOffset = 1/*T&E*/;
      updatedTr.doc.nodesBetween(
        Math.max(paragraphStart-rangeOffset, 0/*don't go behind the start of Document*/),
        Math.min(paragraphEnd+rangeOffset, updatedTr.doc.nodeSize-2/*account for start and end of Document*/),
        (node, pos) => {
          if(isHorizontalRuleNode(node) && !horizontalRuleFound/*select the first HorizontalRule in the Range*/) {
            horizontalRuleFound = true;
            horizontalRulePos = pos;
          } /* else -- ignore */
        });

      updatedTr.setSelection(NodeSelection.create(updatedTr.doc, horizontalRulePos));
      return updatedTr;
    } catch(error) {
      return false/*invalid resulting Selection*/;
    }
  }
}
