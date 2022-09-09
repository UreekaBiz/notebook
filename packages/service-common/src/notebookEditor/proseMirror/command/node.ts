import { Node as ProseMirrorNode, Fragment, ResolvedPos, Slice } from 'prosemirror-model';
import { EditorState, NodeSelection, Selection, TextSelection, Transaction } from 'prosemirror-state';
import { canJoin, canSplit, liftTarget, replaceStep, ReplaceAroundStep, ReplaceStep } from 'prosemirror-transform';

import { isBlank } from '../../../util';
import { Attributes } from '../attribute';
import { isMarkHolderNode } from '../extension/markHolder';
import { NodeName } from '../node';
import { NotebookSchemaType } from '../schema';
import { isGapCursorSelection } from '../selection';
import { AbstractDocumentUpdate, Command } from './type';

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
  public update(editorState: EditorState<NotebookSchemaType>, tr: Transaction<NotebookSchemaType>) {
    const { schema } = editorState;
    if(isGapCursorSelection(tr.selection)) return false/*do not allow creation when selection is GapCursor*/;

    const { $anchor, $head } = tr.selection;
    const blockNodeType = schema.nodes[this.blockNodeName];

    // if the current Block and the Selection are both empty
    // (or only a MarkHolder is present), replace the
    // parent Block with the desired Block
    const { content, textContent, firstChild } = $anchor.parent;
    const { size: contentSize } = content;
    if(tr.selection.empty/*empty implies parent($anchor) === parent($head)*/ &&
      (contentSize < 1/*parent has no content*/ ||
      isBlank(textContent)/*the content is only white space*/ ||
      contentSize === 1 && firstChild && isMarkHolderNode(firstChild)/*parent only has a MarkHolder*/)
    ) {
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

// -- Clear -----------------------------------------------------------------------
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
  public update(editorState: EditorState<NotebookSchemaType>, tr: Transaction<NotebookSchemaType>) {
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
  public update(editorState: EditorState<NotebookSchemaType>, tr: Transaction<NotebookSchemaType>) {
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

    let nodeBefore = $cut.nodeBefore!;

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
// -- Util ------------------------------------------------------------------------
const textblockAt = (node: ProseMirrorNode, side: 'start' | 'end', only = false) => {
  for(let scan: ProseMirrorNode | undefined | null = node; scan; scan = (side == 'start' ? scan.firstChild : scan.lastChild)) {
    if(scan.isTextblock) return true/*Node is Text Block*/;
    if(only && scan.childCount != 1) return false/*default*/;
  }
  return false/*default*/;
};

// ................................................................................
const findCutBefore = ($pos: ResolvedPos): ResolvedPos | null => {
  if(!$pos.parent.type.spec.isolating) {
    for(let i=$pos.depth-1/*start with parent of $pos*/; i >= 0; i--) {
      if($pos.index(i) > 0) {
        return $pos.doc.resolve($pos.before(i + 1));
      } /* else -- Node at $pos is the first child of its parent */

      if($pos.node(i).type.spec.isolating) break/*do not check further*/;
    }
  } /* else -- parent is has isolating property, do not check */

  return null/*default*/;
};

// ................................................................................
const deleteBarrier = (state: EditorState, $cut: ResolvedPos) => {
  const nodeBefore = $cut.nodeBefore!;
  const nodeAfter = $cut.nodeAfter!;
  let conn;
  let match;
  if(nodeBefore.type.spec.isolating || nodeAfter.type.spec.isolating) return false/*do not check*/;

  const joinMaybeClearUpdatedTr = joinMaybeClear(state, $cut);
  if(joinMaybeClearUpdatedTr) {
    return joinMaybeClearUpdatedTr/*updated*/;
  } /* else -- did not join or cleared */

  let canDelAfter = $cut.parent.canReplace($cut.index(), $cut.index() + 1);
  if(canDelAfter && (conn = (match = nodeBefore.contentMatchAt(nodeBefore.childCount)).findWrapping(nodeAfter.type)) && match.matchType(conn[0] || nodeAfter.type)!.validEnd) {
    let end = $cut.pos + nodeAfter.nodeSize,
        wrap = Fragment.empty;
    for(let i = conn.length - 1; i >= 0; i--) {
      wrap = Fragment.from(conn[i].create(null, wrap));
    }
    wrap = Fragment.from(nodeBefore.copy(wrap));

    const tr = state.tr.step(new ReplaceAroundStep($cut.pos - 1, end, $cut.pos, end, new Slice(wrap, 1, 0), conn.length, true));
    let joinAt = end + 2 * conn.length;

    if(canJoin(tr.doc, joinAt)) {
      tr.join(joinAt);
    } /* else -- cannot join, only scrollIntoView*/
    tr.scrollIntoView();

    return tr/*updated*/;
  } /* else -- cannot join */

  const selAfter = Selection.findFrom($cut, 1);
  const range = selAfter && selAfter.$from.blockRange(selAfter.$to), target = range && liftTarget(range);
  if(target != null && target >= $cut.depth) {
    return state.tr.lift(range!, target).scrollIntoView();
  } /* else -- cannot lift */

  if(canDelAfter && textblockAt(nodeAfter, 'start', true) && textblockAt(nodeBefore, 'end')) {
    let at = nodeBefore;
    const wrap = [];
    for(;;) {
      wrap.push(at);
      if(at.isTextblock) break;
      at = at.lastChild!;
    }

    let afterText = nodeAfter,
        afterDepth = 1;
    for(; !afterText.isTextblock; afterText = afterText.firstChild!) {
      afterDepth++;
    }
    if(at.canReplace(at.childCount, at.childCount, afterText.content)) {
      let end = Fragment.empty;
      for(let i = wrap.length - 1; i >= 0; i--) {
        end = Fragment.from(wrap[i].copy(end));
      }
      let tr = state.tr.step(new ReplaceAroundStep($cut.pos - wrap.length, $cut.pos + nodeAfter.nodeSize,
                                                    $cut.pos + afterDepth, $cut.pos + nodeAfter.nodeSize - afterDepth,
                                                    new Slice(end, wrap.length, 0), 0, true));
          tr.scrollIntoView();
      return tr/*updated*/;
    }
  } /* else -- could not replace */

  return false/*default*/;
};

// ................................................................................
const joinMaybeClear = (state: EditorState, $pos: ResolvedPos) => {
  const nodeBefore = $pos.nodeBefore;
  const nodeAfter = $pos.nodeAfter;
  const index = $pos.index();

  // @ts-ignore even though compatibleContent is not defined on the type of the
  //            Node, the property does exist. This may be due to a mismatch in
  //            the versions of prosemirror-model
  if(!nodeBefore || !nodeAfter || !nodeBefore.type.compatibleContent(nodeAfter.type)) return false/*no valid Content*/;

  if(!nodeBefore.content.size && $pos.parent.canReplace(index - 1, index)) {
    return state.tr.delete($pos.pos - nodeBefore.nodeSize, $pos.pos).scrollIntoView();
  } /* else -- nodeBefore has Content, Content from index-1 to index can be replaced */

  if(!$pos.parent.canReplace(index, index + 1) || !(nodeAfter.isTextblock || canJoin(state.doc, $pos.pos))) {
    return false/* replacement cannot be performed, nodeAfter is not a Text Block or content can be joined*/;
  } /* else -- clear incompatible and join */

  return state.tr.clearIncompatible($pos.pos, nodeBefore.type, nodeBefore.contentMatchAt(nodeBefore.childCount))
                 .join($pos.pos)
                 .scrollIntoView();
};
