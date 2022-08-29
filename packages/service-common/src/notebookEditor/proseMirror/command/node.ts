import { EditorState, Selection, Transaction } from 'prosemirror-state';

import { Attributes } from '../attribute';
import { NodeName } from '../node';
import { isGapCursorSelection, getBlockNodeRange } from '../selection';
import { AbstractDocumentUpdate, Command } from './type';

// ********************************************************************************
// REF: https://github.com/ProseMirror/prosemirror-commands/blob/20fa086dfe21f7ce03e5a05b842cf04e0a91e653/src/commands.ts
/** Creates a Block Node below the current Selection */
export const createBlockNodeCommand = (blockNodeName: NodeName, attributes: Partial<Attributes>): Command => (state, dispatch) => {
  const updatedTr =  new CreateCodeBlockNodeDocumentUpdate(blockNodeName, attributes).update(state, state.tr);
  dispatch(updatedTr);
  return true/*Command executed*/;
};
export class CreateCodeBlockNodeDocumentUpdate implements AbstractDocumentUpdate {
  public constructor(private blockNodeName: NodeName, private attributes: Partial<Attributes>) {/*nothing additional*/}

  /*
   * modify the given Transaction such that a Bloc Node is created
   * below the current Selection
   */
  public update(editorState: EditorState, tr: Transaction) {
    const sameParent = editorState.selection.$anchor.sameParent(editorState.selection.$head);
    if(sameParent && editorState.selection.$anchor.parent.type.name === this.blockNodeName) {
      return tr/*no updates*/;
    } /* else -- try to create Block below */

    const { schema } = editorState;
    if(isGapCursorSelection(tr.selection)) return tr/*no updates*/;

    const { $anchor, $head } = tr.selection;
    const blockNodeType = schema.nodes[this.blockNodeName];

    if(sameParent && $anchor.parent.content.size < 1) {
      const { from, to } = getBlockNodeRange(tr.selection);
      tr.setBlockType(from, to, blockNodeType, this.attributes);
      return tr/*no further updates needed*/;
    } /* else -- not the same parent (multiple Selection) or content not empty, insert Block below */

    const above = $head.node(-1/*document level*/),
          after = $head.indexAfter(-1/*document level*/);

    if(!blockNodeType || !above.canReplaceWith(after, after, blockNodeType)) return tr/*no updates*/;

    const creationPos = $head.after();
    const newBlockNode = blockNodeType.createAndFill(this.attributes);
    if(!newBlockNode) return tr/*no updates*/;

    tr.replaceWith(creationPos, creationPos, newBlockNode)
      .setSelection(Selection.near(tr.doc.resolve(creationPos), 1/*look forwards first*/));

    return tr/*updated*/;
  }
}
