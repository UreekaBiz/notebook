import { Editor } from '@tiptap/core';
import { Node as ProseMirrorNode } from 'prosemirror-model';
import { EditorState, Transaction } from 'prosemirror-state';

import { isBlank, isHeadingNode, isNodeSelection, isParagraphNode, AbstractDocumentUpdate, AttributeType, Command, NodeName, SetNodeSelectionDocumentUpdate, TextAlign, UpdateAttributesDocumentUpdate, VerticalAlign } from '@ureeka-notebook/web-service';

import { applyDocumentUpdates } from 'notebookEditor/command/update';
import { isListNode } from 'notebookEditor/extension/list/util';
import { separateUnitFromString, DEFAULT_UNIT, DEFAULT_UNIT_VALUE } from 'notebookEditor/theme/type';

// ********************************************************************************
// == Attribute ===================================================================
// -- Indentation -----------------------------------------------------------------
/** decrease or increase the indentation of the selected Blocks */
export const changeBlockIndentationCommand = (changeType: 'dedent' | 'indent'): Command => (state, dispatch) => {
  const updatedTr =  new ChangeBlockIndentationDocumentUpdate(changeType).update(state, state.tr);
  if(updatedTr) {
    dispatch(updatedTr);
    return true/*Command executed*/;
  } /* else -- Command cannot be executed */

  return false/*not executed*/;
};
export class ChangeBlockIndentationDocumentUpdate implements AbstractDocumentUpdate {
  public constructor(private readonly changeType: 'dedent' |'indent') {/*nothing additional*/ }

  /*
   * modify the given Transaction such that the indentation of the Blocks at the
   * current Selection is decreased or increased
   */
  public update(editorState: EditorState, tr: Transaction) {
    const { from, to } = tr.selection;
    tr.doc.nodesBetween(from, to, (node, pos) => changeNodeIndentation(this.changeType, node, pos, tr));
    return tr/*updated*/;
  }
}
// NOTE: extracted into utilities to separate from Command logic
const changeNodeIndentation = (changeType: 'dedent' | 'indent', node: ProseMirrorNode, nodePos: number, tr: Transaction) => {
  if(!(node.isTextblock || isListNode(node))) return/*ignore Node*/;

  // only change the indentation of Nodes that are direct children of the Doc
  if(tr.doc.resolve(nodePos).depth !== 0/*(SEE: comment above)*/) return/*ignore Node*/;

  const currentIndentation = node.attrs[AttributeType.MarginLeft];
  const newIndentation = getNewIndentation(changeType, currentIndentation);
  if(!newIndentation) return/*ignore Node*/;

  tr.setNodeMarkup(nodePos, undefined/*maintain type*/, { ...node.attrs, [AttributeType.MarginLeft]: newIndentation });
};
const getNewIndentation = (changeType: 'dedent' | 'indent', currentIndentation: string | undefined) => {

  if(!(currentIndentation) || isBlank(currentIndentation)) {
    return `${DEFAULT_UNIT_VALUE}${DEFAULT_UNIT}`;
  } /* else -- an indentation has already been defined */

  // -- set to default Indentation ------------------------------------------------
  let [value, unit] = separateUnitFromString(currentIndentation);
  if(!unit || (unit !== DEFAULT_UNIT)) {
    return `${DEFAULT_UNIT_VALUE}${DEFAULT_UNIT}`;
  } /* else -- units already valid */

  // -- decrease or increase Indentation ------------------------------------------
  if(changeType === 'dedent') {
    return `${Number(value) - DEFAULT_UNIT_VALUE}${DEFAULT_UNIT}`;
  } /* else -- indenting */
  return `${Number(value) + DEFAULT_UNIT_VALUE}${DEFAULT_UNIT}`;
};


// -- Alignment -------------------------------------------------------------------
// .. Horizontal Align ............................................................
/** Change the Horizontal Alignment of the Blocks in the Selection Range */
export const changeHorizontalAlignmentCommand = (alignment: TextAlign): Command => (state, dispatch) => {
  const updatedTr =  new ChangeHorizontalAlignmentDocumentUpdate(alignment).update(state, state.tr);
  if(updatedTr) {
    dispatch(updatedTr);
    return true/*Command executed*/;
  } /* else -- Command cannot be executed */

  return false/*not executed*/;
};
export class ChangeHorizontalAlignmentDocumentUpdate implements AbstractDocumentUpdate {
  public constructor(private readonly alignment:TextAlign) {/*nothing additional*/ }

  /*
   * Modify the given Transaction such that the Horizontal Alignment of the Blocks
   * in the current Selection are changed
   */
  public update(editorState: EditorState, tr: Transaction) {
    const { empty, $from, from, to } = tr.selection;
    if(empty) {
        changeNodeAlignment(this.alignment, $from.parent, from - $from.parentOffset - 1/*the Block Node itself*/, tr);
    } else {
      tr.doc.nodesBetween(from, to, (node, pos) => changeNodeAlignment(this.alignment, node, pos, tr));
    }

    return tr/*updated*/;
  }
}
// NOTE: this utility only changes Paragraphs and Headings
//       on purpose
const changeNodeAlignment = (alignment: TextAlign, node: ProseMirrorNode, nodePos: number, tr: Transaction) => {
  if(isHeadingNode(node) || isParagraphNode(node)) {
    tr.setNodeMarkup(nodePos, undefined/*maintain type*/, { ...node.attrs, [AttributeType.TextAlign]: alignment });
  } /* else -- check for TaskListItem */
};

// .. Vertical Align ..............................................................
// NOTE: this is an utility and not a Command since it
//       makes use of applyDocumentUpdates
// sets the vertical alignment Attribute for a Node if it is not currently bottom,
// or sets it to 'bottom' if the desiredAlignment is the same it already has
export const setVerticalAlign = (editor: Editor, desiredAlignment: VerticalAlign): boolean => {
  const { selection } = editor.state;
  const nodePos = selection.anchor;
  if(!isNodeSelection(selection)) return false/*do not handle*/;

  const { name: nodeName } = selection.node.type,
        shouldSetBottom = selection.node.attrs[AttributeType.VerticalAlign] === desiredAlignment;

  return applyDocumentUpdates(editor, [
    new UpdateAttributesDocumentUpdate(nodeName as NodeName/*guaranteed by above check*/, { [AttributeType.VerticalAlign]: shouldSetBottom ? VerticalAlign.bottom : desiredAlignment }),
    new SetNodeSelectionDocumentUpdate(nodePos),
  ]);
};
