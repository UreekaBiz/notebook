import { MarkType, NodeType } from 'prosemirror-model';
import { EditorState, Transaction } from 'prosemirror-state';

import { Attributes, AttributeType } from '../attribute';
import { MarkName } from '../mark';
import { NodeName } from '../node';
import { NotebookSchemaType } from '../schema';
import { getSelectedNode, SelectionDepth } from '../selection';
import { AbstractDocumentUpdate, Command } from './type';

// ********************************************************************************
/**
 * update the attributes for the Nodes or Marks in the Selection whose name
 *  equals the given {@link NodeName} or {@link MarkName}. Differs from
 *  UpdateAttributesInRangeCommand in that only Nodes that have the specified
 *  name get their attributes updated (SEE: UpdateAttributesInRangeCommand below)
 */
export const updateAttributesCommand = (nodeOrMarkName: NodeName | MarkName, attributes: Partial<Attributes>): Command => (state, dispatch) => {
  const updatedTr = new UpdateAttributesDocumentUpdate(nodeOrMarkName, attributes).update(state, state.tr);
  if(updatedTr) {
    dispatch(updatedTr);
    return true/*Command executed*/;
  } /* else -- Command cannot be executed */

  return false/*not executed*/;
};
export class UpdateAttributesDocumentUpdate implements AbstractDocumentUpdate {
  public constructor(private readonly nodeOrMarkName: NodeName | MarkName, private readonly attributes: Partial<Attributes>) {/*nothing additional*/}
  /*
   * modify the given Transaction such that the Nodes in the current Selection
   * get the specified attribute updated to the specified value
   */
  public update(editorState: EditorState<NotebookSchemaType>, tr: Transaction<NotebookSchemaType>) {
    let nodeType: NodeType | undefined = undefined/*default*/,
        markType: MarkType | undefined = undefined/*default*/;
    const { schema } = editorState;

    if(this.nodeOrMarkName in NodeName) {
      nodeType = schema.nodes[this.nodeOrMarkName];
    } else if(this.nodeOrMarkName in MarkName) {
      markType = schema.marks[this.nodeOrMarkName];
    } else {
      return false/*not a valid Node or Mark name, nothing to do*/;
    }

    tr.selection.ranges.forEach(range => {
      const from = range.$from.pos;
      const to = range.$to.pos;

      editorState.doc.nodesBetween(from, to, (node, pos) => {
        if(nodeType && nodeType === node.type) {
          tr.setNodeMarkup(pos, undefined/*maintain type*/, { ...node.attrs, ...this.attributes });
        } /* else -- no nodeType or Node is not of specified type, ignore */

        if(markType && node.marks.length) {
          node.marks.forEach(mark => {
            if(markType === mark.type) {
              // compute specific Range of the Mark
              const markFrom = Math.max(pos, from),
                    markTo = Math.min(pos + node.nodeSize, to);

              tr.addMark(markFrom, markTo, markType.create({ ...mark.attrs, ...this.attributes }));
            } /* else -- Mark does not equal specified type, do not modify */
          });
        }/* else -- no markType or Mark is not of specified type, ignore */
      });
    });

    return tr/*updated*/;
  }
}

// --------------------------------------------------------------------------------
/**
 * set specified attribute to the specified value for the Nodes in the
 * current Selection. Differs from 'updateAttributesCommand' in that the Attributes
 * are affected for all Nodes in the Selection Range, regardless of their type
 * (SEE: updateAttributesCommand above)
 */
export const updateAttributesInRangeCommand = (attribute: AttributeType, value: string, depth: SelectionDepth): Command => (state, dispatch) => {
  const updatedTr = new UpdateAttributesInRangeDocumentUpdate(attribute, value, depth).update(state, state.tr);
  if(updatedTr) {
    dispatch(updatedTr);
    return true/*Command executed*/;
  } /* else -- Command cannot be executed */

  return false/*not executed*/;
};
export class UpdateAttributesInRangeDocumentUpdate implements AbstractDocumentUpdate {
  public constructor(private readonly attribute: AttributeType, private readonly value: string, private readonly depth: SelectionDepth) {/*nothing additional*/}
  /*
   * modify the given Transaction such that the Nodes in the current Selection
   * get the specified attribute updated to the specified value
   */
  public update(editorState: EditorState<NotebookSchemaType>, tr: Transaction<NotebookSchemaType>) {
    tr.setSelection(editorState.selection);
    const { from, to } = tr.selection;

    // its a grouped selection: iterate over the Nodes and set the style on each of them
    if(from !== to) {
      const { doc } = tr;
      doc.nodesBetween(from, to, (node, pos) => {
        if(!tr.doc || !node || node.isText) return false/*nothing to do, do not include Text Nodes since they cannot have attributes*/;

        const nodeAttrs = { ...node.attrs, [this.attribute]: this.value };
        tr.setNodeMarkup(pos, undefined/*preserve type*/, nodeAttrs);
        return true/*continue*/;
      });
    } else {
      const node = getSelectedNode(editorState, this.depth);
      if(!node) return tr/*nothing left to do*/;

      const nodeAttrs = { ...node.attrs, [this.attribute]: this.value };
      let pos = editorState.selection.$anchor.before(this.depth);
      // NOTE: there is a case when the Node size is 1. Any attempt to select the Node
      //       based on its depth from the selection will select either the Node before
      //       or after that. This is a hack until a better one is found.
      if(node.nodeSize == 1) pos++;

      tr.setNodeMarkup(pos, undefined/*preserve type*/, nodeAttrs);
    }

    return tr/*updated*/;
  }
}
