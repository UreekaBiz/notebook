import { EditorState, Selection, Transaction } from 'prosemirror-state';
import { liftTarget } from 'prosemirror-transform';

import { Attributes } from '../attribute';
import { NodeName } from '../node';
import { NotebookSchemaType } from '../schema';
import { isGapCursorSelection } from '../selection';
import { AbstractDocumentUpdate, Command } from './type';

// ********************************************************************************
// REF: https://github.com/ProseMirror/prosemirror-commands/blob/20fa086dfe21f7ce03e5a05b842cf04e0a91e653/src/commands.ts
/** Creates a Block Node below the current Selection */
export const createBlockNodeCommand = (blockNodeName: NodeName, attributes: Partial<Attributes>): Command => (state, dispatch) => {
  const updatedTr =  new CreateCodeBlockNodeDocumentUpdate(blockNodeName, attributes).update(state, state.tr);
  if(updatedTr) {
    dispatch(updatedTr);
    return true/*Command executed*/;
  } /* else -- Command cannot be executed */

  return false/*not executed*/;
};
export class CreateCodeBlockNodeDocumentUpdate implements AbstractDocumentUpdate {
  public constructor(private readonly blockNodeName: NodeName, private readonly attributes: Partial<Attributes>) {/*nothing additional*/}

  /*
   * modify the given Transaction such that a Bloc Node is created
   * below the current Selection
   */
  public update(editorState: EditorState<NotebookSchemaType>, tr: Transaction<NotebookSchemaType>) {
    const { empty } = tr.selection;
    if(!empty) {
      return false/*do not allow on multiple Node Selection*/;
    } /* else -- try to create Block below */

    const { schema } = editorState;
    if(isGapCursorSelection(tr.selection)) return false/*do not allow creation when selection is GapCursor*/;

    const { $anchor, $head } = tr.selection;
    const blockNodeType = schema.nodes[this.blockNodeName];

    // if the current Block is empty, replace it with the desired Block
    // NOTE: empty implies parent($anchor) === parent($head)
    if(empty && $anchor.parent.content.size < 1) {
      const parentBlockRange = $anchor.blockRange($anchor);
      if(!parentBlockRange) return false/*no parent Block Range*/;

      const { $from, $to } = parentBlockRange;
      tr.setBlockType($from.pos, $to.pos, blockNodeType, this.attributes)
        .setSelection(Selection.near(tr.doc.resolve($to.pos)));

      return tr/*nothing left to do*/;
    } /* else -- not the same parent (multiple Selection) or content not empty, insert Block below */

    const above = $head.node(-1/*document level*/),
          after = $head.indexAfter(-1/*document level*/);

    if(!blockNodeType || !above.canReplaceWith(after, after, blockNodeType)) return false/*cannot replace Node above*/;

    const creationPos = $head.after();
    const newBlockNode = blockNodeType.createAndFill(this.attributes);
    if(!newBlockNode) return false/*no valid wrapping was found*/;

    tr.replaceWith(creationPos, creationPos, newBlockNode)
      .setSelection(Selection.near(tr.doc.resolve(creationPos + 1/*inside the new Block*/), 1/*look forwards first*/));

    return tr/*updated*/;
  }
}

/** clear the Nodes in the current Block */
export const clearNodesCommand = (): Command => (state, dispatch) => {
  const updatedTr =  new ClearNodesDocumentUpdate().update(state, state.tr);
  if(updatedTr) {
    dispatch(updatedTr);
    return true/*Command executed*/;
  } /* else -- Command cannot be executed */

  return false/*not executed*/;
};
export class ClearNodesDocumentUpdate implements AbstractDocumentUpdate {
  public constructor() {/*nothing additional*/}

  public update(editorState: EditorState<NotebookSchemaType>, tr: Transaction<NotebookSchemaType>) {
    const { selection } = tr;
    const { ranges } = selection;

    ranges.forEach(({ $from, $to }) => {
      editorState.doc.nodesBetween($from.pos, $to.pos, (node, pos) => {
        if(node.type.isText) {
          return/*nothing to do, keep descending*/;
        } /* else -- not a Text Node */

        const { doc, mapping } = tr;
        const $mappedFrom = doc.resolve(mapping.map(pos));
        const $mappedTo = doc.resolve(mapping.map(pos + node.nodeSize));
        const nodeRange = $mappedFrom.blockRange($mappedTo);

        if(!nodeRange) {
          return/*valid Block Range not found*/;
        } /* else -- clear Nodes to default Block type by Lifting */

        const targetLiftDepth = liftTarget(nodeRange);
        if(node.type.isTextblock) {
          const { defaultType } = $mappedFrom.parent.contentMatchAt($mappedFrom.index());
          tr.setNodeMarkup(nodeRange.start, defaultType);
        } /* else -- default Block is not a TextBlock, just try to lift */

        if(targetLiftDepth || targetLiftDepth === 0/*top level of the Document*/) {
          tr.lift(nodeRange, targetLiftDepth);
        } /* else -- do not lift */
      });
    });

    return tr/*updated*/;
  }
}
