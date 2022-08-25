import { Selection } from 'prosemirror-state';

import { Attributes } from '../attribute';
import { NodeName } from '../node';
import { isGapCursorSelection, getBlockNodeRange } from '../selection';
import { Command } from './type';

// ********************************************************************************
// REF: https://github.com/ProseMirror/prosemirror-commands/blob/20fa086dfe21f7ce03e5a05b842cf04e0a91e653/src/commands.ts
/** Creates a Block Node below the current Selection */
export const createBlockNode = (blockNodeName: NodeName, attributes: Partial<Attributes>): Command => (state, dispatch) => {
  const sameParent = state.selection.$anchor.sameParent(state.selection.$head);
  if(sameParent && state.selection.$anchor.parent.type.name === blockNodeName) {
    return false/*do not allow codeBlocks to be toggable*/;
  } /* else -- try to create Block below */

  const { schema, tr } = state;
  if(isGapCursorSelection(tr.selection)) return false/*do not allow insertion of Block when GapCursor is set*/;

  const { $anchor, $head } = tr.selection;
  const blockNodeType = schema.nodes[blockNodeName];

  if(sameParent && $anchor.parent.content.size < 1) {
    const { from, to } = getBlockNodeRange(tr.selection);
    tr.setBlockType(from, to, blockNodeType, attributes);
    dispatch(tr);
    return true/*Command executed*/;
  } /* else -- not the same parent (multiple Selection) or content not empty, insert Block below */

  const above = $head.node(-1/*document level*/),
        after = $head.indexAfter(-1/*document level*/);

  if(!blockNodeType || !above.canReplaceWith(after, after, blockNodeType)) return false/*cannot perform creation*/;

  const creationPos = $head.after();
  const newBlockNode = blockNodeType.createAndFill(attributes);
  if(!newBlockNode) return false/*no fitting wrapping found, Block Node not created*/;

  tr.replaceWith(creationPos, creationPos, newBlockNode)
    .setSelection(Selection.near(tr.doc.resolve(creationPos), 1/*look forwards first*/));

  dispatch(tr.scrollIntoView());
  return true/*Command executed*/;
};
