import { MarkType, NodeType } from 'prosemirror-model';
import { EditorState, Transaction } from 'prosemirror-state';
import { AttrStep } from 'prosemirror-transform';

import { Attributes, AttributeType } from '../attribute';
import { isMarkName, MarkName } from '../mark';
import { isNodeName, NodeName } from '../node';
import { getSelectedNode, SelectionDepth } from '../selection';
import { AbstractDocumentUpdate, Command, HISTORY_META } from './type';

// ********************************************************************************
/**
 *  update the attributes for the Nodes or Marks in the Selection whose name
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
  public update(editorState: EditorState, tr: Transaction) {
    let nodeType: NodeType | undefined = undefined/*default*/,
        markType: MarkType | undefined = undefined/*default*/;
    const { schema } = editorState;

    if(isNodeName(this.nodeOrMarkName)) {
      nodeType = schema.nodes[this.nodeOrMarkName];
    } else if(isMarkName(this.nodeOrMarkName)) {
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
  public update(editorState: EditorState, tr: Transaction) {
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

// --------------------------------------------------------------------------------
// REF: https://discuss.prosemirror.net/t/preventing-image-placeholder-replacement-from-being-undone/1394/2
/**
 * update the Attributes of the Node at the given position,
 * using {@link AttrStep}s, which do not replace the Node entirely (they do not
 * add content, (SEE: REF above)). This type of Command can hence be used
 * whenever the update of the attributes should not go into the History or for
 * updates that are meant to be granular.
 *
 * If {@param addToHistory} is 'false' (defaults to 'true'), the operation
 * Transaction will not be added to the History. This is ideal for asynchronous
 * update attributes, whose effects should (usually) not be undo-able
 */
 export const updateSingleNodeAttributesCommand = <T extends Attributes>(nodeName: NodeName, nodePosition: number, attributes: Partial<T>, addToHistory = true): Command => (state, dispatch) => {
  const updatedTr = new UpdateSingleNodeAttributesDocumentUpdate(nodeName, nodePosition, attributes, addToHistory).update(state, state.tr);
  if(updatedTr) {
    dispatch(updatedTr);
    return true/*Command executed*/;
  } /* else -- Command cannot be executed */

  return false/*not executed*/;
};
export class UpdateSingleNodeAttributesDocumentUpdate implements AbstractDocumentUpdate {
  public constructor(private readonly nodeName: NodeName, private readonly nodePosition: number, private readonly attributes: Partial<Attributes>, private readonly addToHistory: boolean) {/*nothing additional*/}

  /*
   * Modify the Transaction such that the Attributes of the Node at the given
   * position are modified, using AttrSteps
   * (SEE: #updateSingleNodeAttributesCommand above)
   */
  public update(editorState: EditorState, tr: Transaction) {
    // since this Document update can be used to update attributes of Nodes
    // asynchronously, wrap to prevent errors
    try {
      const attrEntries = Object.entries(this.attributes);
      for(let i=0; i<attrEntries.length; i++) {
        const updatedNode = tr.doc.nodeAt(this.nodePosition);
        if(!updatedNode || updatedNode.type.name !== this.nodeName) return false/*Node no longer exists or its position changed*/;

        tr.step(new AttrStep(this.nodePosition, attrEntries[i][0/*attributeName*/], attrEntries[i][1/*attributeValue*/]));
      }

      if(!this.addToHistory) {
        tr.setMeta(HISTORY_META, this.addToHistory);
      } /* else -- allow Transaction to be undo-able*/

      return tr/*updated*/;
    } catch(error) {
      return false/*Node no longer exists or its position changed*/;
    }
  }
}
