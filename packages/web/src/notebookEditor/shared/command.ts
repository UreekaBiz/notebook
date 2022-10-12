import { Editor } from '@tiptap/core';
import { Node as ProseMirrorNode } from 'prosemirror-model';
import { EditorState, Transaction } from 'prosemirror-state';

import { isBlank, isHeadingNode, isListItemNode, isListItemContentNode, isNodeSelection, isParagraphNode, isTaskListItemNode, AbstractDocumentUpdate, AttributeType, Command, NodeName, SetNodeSelectionDocumentUpdate, TextAlign, UpdateAttributesDocumentUpdate, VerticalAlign, JustifyContent } from '@ureeka-notebook/web-service';

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
      if(isListItemContentNode($from.parent)) {
        const listItemContentParentPos = from - $from.parentOffset - 1/*the ListItemContent itself*/,
              listItemGrandParentPos = listItemContentParentPos-1/*parent of ListItemContent*/,
              listItemGrandParent = editorState.doc.nodeAt(listItemGrandParentPos);
        if(!listItemGrandParent) return false/*invalid position*/;

        changeNodeAlignment(this.alignment, listItemGrandParent, listItemGrandParentPos, tr);
        } else {
          // regular Block
          changeNodeAlignment(this.alignment, $from.parent, from - $from.parentOffset - 1/*the Block Node itself*/, tr);
      }
    } else {
      tr.doc.nodesBetween(from, to, (node, pos) => changeNodeAlignment(this.alignment, node, pos, tr));
    }

    return tr/*updated*/;
  }
}
// NOTE: this utility only changes Paragraphs, Headings
//       ListItems or TaskListItems on purpose since they
//       are the only Block Nodes for which changing the
//       Horizontal Alignment makes sense
const changeNodeAlignment = (alignment: TextAlign, node: ProseMirrorNode, nodePos: number, tr: Transaction) => {
  if(isHeadingNode(node) || isParagraphNode(node) || isListItemNode(node)) {
    tr.setNodeMarkup(nodePos, undefined/*maintain type*/, { ...node.attrs, [AttributeType.TextAlign]: alignment });
  } /* else -- check for TaskListItem */

  if(isTaskListItemNode(node)) {
    let justifyContent = ''/*default*/;
    switch(alignment) {
      case TextAlign.left: { justifyContent = JustifyContent.start; break; }
      case TextAlign.center: { justifyContent = JustifyContent.center; break; }
      case TextAlign.right: { justifyContent = JustifyContent.end; break; }
      case TextAlign.justify: { justifyContent = JustifyContent.justify; break; }
    }
    tr.setNodeMarkup(nodePos, undefined/*maintain type*/, { ...node.attrs, [AttributeType.JustifyContent]: justifyContent });
  } /* else -- ignore Node */
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
