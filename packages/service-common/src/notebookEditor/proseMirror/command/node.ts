import { Slice } from 'prosemirror-model';
import { EditorState, NodeSelection, Selection, TextSelection, Transaction } from 'prosemirror-state';
import { canSplit, liftTarget, replaceStep, ReplaceStep } from 'prosemirror-transform';

import { isBlank } from '../../../util';
import { Attributes } from '../attribute';
import { isMarkHolderNode } from '../extension/markHolder';
import { isTextNode } from '../extension/text';
import { NodeName } from '../node';
import { isGapCursorSelection } from '../selection';
import { AbstractDocumentUpdate, Command } from './type';
import { defaultBlockAt, deleteBarrier, findCutBefore, textblockAt } from './util';

// ********************************************************************************
// -- Create ----------------------------------------------------------------------
// REF: https://github.com/ProseMirror/prosemirror-commands/blob/20fa086dfe21f7ce03e5a05b842cf04e0a91e653/src/commands.ts
/** Creates a Block Node below the current Selection */
export const createBlockNodeCommand = (blockNodeName: NodeName, attributes: Partial<Attributes>): Command => (state, dispatch) => {
  const updatedTr =  new CreateBlockNodeDocumentUpdate(blockNodeName, attributes).update(state, state.tr);
  if(updatedTr) {
    dispatch(updatedTr);
    return true/*Command executed*/;
  } /* else -- Command cannot be executed */

  return false/*not executed*/;
};
export class CreateBlockNodeDocumentUpdate implements AbstractDocumentUpdate {
  public constructor(private readonly blockNodeName: NodeName, private readonly attributes: Partial<Attributes>) {/*nothing additional*/}

  /*
   * modify the given Transaction such that a Bloc Node is created
   * below the current Selection
   */
  public update(editorState: EditorState, tr: Transaction) {
    const { schema } = editorState;
    if(isGapCursorSelection(tr.selection)) return false/*do not allow creation when selection is GapCursor*/;

    const { $anchor, $head } = tr.selection;
    const blockNodeType = schema.nodes[this.blockNodeName];

    // if the current Block and the Selection are both empty
    // (or only a MarkHolder is present), replace the
    // parent Block with the desired Block
    const { content, firstChild } = $anchor.parent;
    const { size: contentSize } = content;

    let onlyContainsEmptyTextNodes = true/*default*/;
    $anchor.parent.content.forEach(child => {
      if(!isTextNode(child) || !isBlank(child.textContent)) {
        onlyContainsEmptyTextNodes = false;
      } /* else -- do not change default */
    });

    if(tr.selection.empty/*empty implies parent($anchor) === parent($head)*/ &&
      (contentSize < 1/*parent has no content*/ ||
      onlyContainsEmptyTextNodes/*the content is only white space and there are no atom nodes*/ ||
      contentSize === 1 && firstChild && isMarkHolderNode(firstChild)/*parent only has a MarkHolder*/)
    ) {
      const parentBlockRange = $anchor.blockRange($anchor);
      if(!parentBlockRange) return false/*no parent Block Range*/;

      const { $from, $to } = parentBlockRange;
      tr.setBlockType($from.pos, $to.pos, blockNodeType, this.attributes)
        .setSelection(Selection.near(tr.doc.resolve($to.pos-1/*inside the new Block*/)));

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

// -- Clear -----------------------------------------------------------------------
/** clear the Nodes in the current Block */
export const clearNodesCommand: Command = (state, dispatch) => {
  const updatedTr =  new ClearNodesDocumentUpdate().update(state, state.tr);
  if(updatedTr) {
    dispatch(updatedTr);
    return true/*Command executed*/;
  } /* else -- Command cannot be executed */

  return false/*not executed*/;
};
export class ClearNodesDocumentUpdate implements AbstractDocumentUpdate {
  public constructor() {/*nothing additional*/}

  public update(editorState: EditorState, tr: Transaction) {
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

// -- Leave -----------------------------------------------------------------------
// REF: https://github.com/ProseMirror/prosemirror-commands/blob/master/src/commands.ts
// create a default Block Node after the one at the current Selection and
// move the cursor there
export const leaveBlockNodeCommand = (nodeName: NodeName): Command => (state, dispatch) => {
  const updatedTr =  new LeaveBlockNodeDocumentUpdate().update(state, state.tr);
  if(updatedTr) {
    dispatch(updatedTr);
    return true/*Command executed*/;
  } /* else -- Command cannot be executed */

  return false/*not executed*/;
};
export class LeaveBlockNodeDocumentUpdate implements AbstractDocumentUpdate {
  public constructor() {/*nothing additional*/}

  /*
   * modify the given Transaction such that a default Block Node is created
   * after the one at the current Selection and the cursor is moved there
   */
  public update(editorState: EditorState, tr: Transaction) {
    const { $head, $anchor } = editorState.selection;
    if(!$head.sameParent($anchor)) return false/*Selection spans multiple Blocks*/;

    const parentOfHead = $head.node(-1),
          indexAfterHeadParent = $head.indexAfter(-1);
    const type = defaultBlockAt(parentOfHead.contentMatchAt(indexAfterHeadParent));

    if(!type) return false/*no valid type was found*/;
    if(!parentOfHead.canReplaceWith(indexAfterHeadParent, indexAfterHeadParent, type)) return false/*invalid replacement*/;

    const newBlockNode = type.createAndFill();
    if(!newBlockNode) return false/*no valid wrapping was found*/;

    const posAfterReplacement = $head.after();
    tr.replaceWith(posAfterReplacement, posAfterReplacement, newBlockNode)
      .setSelection(Selection.near(tr.doc.resolve(posAfterReplacement), 1/*look forwards first*/))
      .scrollIntoView();

    return tr/*updated*/;
  }
}

// -- Lift ------------------------------------------------------------------------
// REF: https://github.com/ProseMirror/prosemirror-commands/blob/master/src/commands.ts
// If the cursor is in an empty Text Block that can be lifted, lift it.
export const liftEmptyBlockNodeCommand = (): Command => (state, dispatch) => {
  const updatedTr =  new LiftEmptyBlockNodeDocumentUpdate().update(state, state.tr);
  if(updatedTr) {
    dispatch(updatedTr);
    return true/*Command executed*/;
  } /* else -- Command cannot be executed */

  return false/*not executed*/;
};
export class LiftEmptyBlockNodeDocumentUpdate implements AbstractDocumentUpdate {
  public constructor() {/*nothing additional*/}

  /*
   * modify the given Transaction such that an empty Block Node is lifted
   * if it exists, and return it
   */
  public update(editorState: EditorState, tr: Transaction) {
    const { $cursor } = editorState.selection as TextSelection/*specifically looking for $cursor*/;
    if(!$cursor || $cursor.parent.content.size) return false/*not a TextSelection or Block is not empty*/;

    if($cursor.depth > 1/*Block is nested*/ && ($cursor.after() != $cursor.end(-1/*absolute pos of the parent*/))) {
      let posBefore = $cursor.before();
      if(canSplit(editorState.doc, posBefore)) {
        return tr.split(posBefore).scrollIntoView();
      } /* else -- cant split, do nothing */
    } /* else -- could not split */

    const range = $cursor.blockRange();
    const targetDepth = range && liftTarget(range);
    if(!range || targetDepth == null) return false/*no targetDepth Depth to which the Content in Range can be lifted found*/;

    return editorState.tr.lift(range, targetDepth).scrollIntoView()/*updated*/;
  }
}

// -- Join ------------------------------------------------------------------------
// REF: https://github.com/ProseMirror/prosemirror-commands/blob/master/src/commands.ts
// if the Selection is empty and at the start of a Text Block, try to reduce the
// distance between that Block and the one before it if there's a Block directly
// before it that can be joined, by joining them. Otherwise try to move the
// selected Block closer to the next one in the Document structure by lifting
// it out of its parent or moving it into a parent of the previous Block
export const joinBackwardCommand: Command = (state, dispatch) => {
  const updatedTr = new JoinBackwardDocumentUpdate().update(state, state.tr);
  if(updatedTr) {
    dispatch(updatedTr);
    return true/*Command executed*/;
  } /* else -- Command cannot be executed */

  return false/*not executed*/;
};
export class JoinBackwardDocumentUpdate implements AbstractDocumentUpdate {
  public constructor() {/*nothing additional*/}

  /**
   * modify the given Transaction such that the conditions described by the
   * joinBackward Command (SEE: joinBackwardCommand above) hold
   */
  public update(editorState: EditorState, tr: Transaction) {
    const { $cursor } = editorState.selection as TextSelection/*specifically looking for $cursor*/;
    if(!$cursor) return false/*selection is not an empty Text selection*/;

    // if there is no Node before this one, try lifting
    const $cut = findCutBefore($cursor);
    if(!$cut) {
      const range = $cursor.blockRange();
      const target = range && liftTarget(range);
      if(target == null) return false/*no target Depth to which the Content in Range can be lifted found*/;

      return editorState.tr.lift(range!, target).scrollIntoView();
    } /* else -- a valid $cut position was found */

    const nodeBefore = $cut.nodeBefore!;

    // try to join
    const deleteBarrierUpdatedTr = deleteBarrier(editorState, $cut);
    if(!nodeBefore.type.spec.isolating && deleteBarrierUpdatedTr) {
      return deleteBarrierUpdatedTr;
    } /* else -- isolating nodeBefore or could not join or replace */

    // if the node below has no content and the node above is
    // selectable, delete the node below and select the one above.
    if($cursor.parent.content.size == 0/*empty*/ && (textblockAt(nodeBefore, 'end') || NodeSelection.isSelectable(nodeBefore))) {
      const deleteStep = replaceStep(editorState.doc, $cursor.before(), $cursor.after(), Slice.empty);
      if(deleteStep && (deleteStep as ReplaceStep/*by definition*/).slice.size < (deleteStep as ReplaceStep/*by definition*/).to - (deleteStep as ReplaceStep).from) {
        const tr = editorState.tr.step(deleteStep);
          tr.setSelection(textblockAt(nodeBefore, 'end') ? Selection.findFrom(tr.doc.resolve(tr.mapping.map($cut.pos, -1)), -1)!
                        : NodeSelection.create(tr.doc, $cut.pos - nodeBefore.nodeSize));
        tr.scrollIntoView();
        return tr/*updated*/;
      }
    }

    // if nodeBefore is an Atom, delete it
    if(nodeBefore.isAtom && $cut.depth == $cursor.depth - 1) {
      return editorState.tr.delete($cut.pos - nodeBefore.nodeSize, $cut.pos).scrollIntoView();
    } /* else -- nodeBefore is not an Atom */

    return false/*could not joinBackward*/;
  }
}
