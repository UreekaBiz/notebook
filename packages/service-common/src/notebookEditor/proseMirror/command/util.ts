import { ContentMatch, Fragment, Node as ProseMirrorNode, ResolvedPos, Slice } from 'prosemirror-model';
import { EditorState, Selection } from 'prosemirror-state';
import { canJoin, liftTarget, ReplaceAroundStep } from 'prosemirror-transform';

// ********************************************************************************
// NOTE: these functions are inspired by those at https://github.com/ProseMirror/prosemirror-commands/blob/master/src/commands.ts

// check whether the first or last child of the given Node is a Text Block, if only
// is given, then said first or last child must only have a single child
export const textblockAt = (node: ProseMirrorNode, side: 'start' | 'end', onlyOneChild = false) => {
  for(let scannedNode: ProseMirrorNode | undefined | null = node; scannedNode; scannedNode = (side === 'start' ? scannedNode.firstChild : scannedNode.lastChild)) {
    if(scannedNode.isTextblock) return true/*Node is Text Block*/;
    if(onlyOneChild && scannedNode.childCount !== 1) return false/*default*/;
  }
  return false/*default*/;
};

// ................................................................................
/** find the defaultBlock given a {@link ContentMatch} */
export const defaultBlockAt = (match: ContentMatch) => {
  for(let i=0; i<match.edgeCount; i++) {
    const { type } = match.edge(i);
    if(type.isTextblock && !type.hasRequiredAttrs()) {
      return type;
    } /* else -- keep looking */
  }

  return undefined/*no default Block found*/;
};

// ................................................................................
// find the ResolvedPos where a JoinBackward operation can be attempted
export const findCutBefore = ($pos: ResolvedPos): ResolvedPos | null => {
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

// find the ResolvedPos where a JoinForward operation can be attempted
export const findCutAfter = ($pos: ResolvedPos): ResolvedPos | null => {
  if(!$pos.parent.type.spec.isolating) {
    for(let i = $pos.depth - 1/*start with parent of $pos*/; i >= 0; i--) {
      const parent = $pos.node(i);
      if($pos.index(i) + 1 < parent.childCount) return $pos.doc.resolve($pos.after(i + 1));

      if(parent.type.spec.isolating) break/*do not cross boundary, since parent has isolating property*/;
    }
  } /* else -- parent of the $pos has isolating property, nothing to do */

  return null/*default*/;
};


// ................................................................................
// try to Join or Delete the Nodes backwards given the $cut ResolvedPos.
// If this is not possible, try to Join or Delete forwards by performing an
// adequate replacement
export const deleteBarrier = (state: EditorState, $cut: ResolvedPos) => {
  const nodeBefore = $cut.nodeBefore!;
  const nodeAfter = $cut.nodeAfter!;
  if(nodeBefore.type.spec.isolating || nodeAfter.type.spec.isolating) return false/*do not check*/;

  const joinMaybeClearUpdatedTr = joinMaybeClear(state, $cut);
  if(joinMaybeClearUpdatedTr) {
    return joinMaybeClearUpdatedTr/*updated*/;
  } /* else -- did not join or cleared */

  let connectorNodeTypes;
  let contentMatch;
  const canDeleteAfter = $cut.parent.canReplace($cut.index(), $cut.index() + 1);
  if(canDeleteAfter && (connectorNodeTypes = (contentMatch = nodeBefore.contentMatchAt(nodeBefore.childCount)).findWrapping(nodeAfter.type)) && contentMatch.matchType(connectorNodeTypes[0] || nodeAfter.type)!.validEnd) {
    let end = $cut.pos + nodeAfter.nodeSize,
        wrapping = Fragment.empty;
    for(let i = connectorNodeTypes.length - 1; i >= 0; i--) {
      wrapping = Fragment.from(connectorNodeTypes[i].create(null, wrapping));
    }
    wrapping = Fragment.from(nodeBefore.copy(wrapping));

    const tr = state.tr.step(new ReplaceAroundStep($cut.pos - 1, end, $cut.pos, end, new Slice(wrapping, 1, 0), connectorNodeTypes.length, true));
    let joinAtPos = end + 2 * connectorNodeTypes.length;

    if(canJoin(tr.doc, joinAtPos)) {
      tr.join(joinAtPos);
    } /* else -- cannot join, only scrollIntoView*/

    tr.scrollIntoView();
    return tr/*updated*/;
  } /* else -- cannot join */

  const selectionAfterCut = Selection.findFrom($cut, 1);
  const blockRange = selectionAfterCut && selectionAfterCut.$from.blockRange(selectionAfterCut.$to), target = blockRange && liftTarget(blockRange);
  if(target != null && target >= $cut.depth) {
    return state.tr.lift(blockRange!, target).scrollIntoView();
  } /* else -- cannot lift */

  if(canDeleteAfter && textblockAt(nodeAfter, 'start', true) && textblockAt(nodeBefore, 'end')) {
    let joinAtNode = nodeBefore;
    const wrap = [];
    for(;;) {
      wrap.push(joinAtNode);
      if(joinAtNode.isTextblock) break/*stop wrapping*/;
      joinAtNode = joinAtNode.lastChild!;
    }

    let nodeAfterText = nodeAfter,
        afterDepth = 1;
    for(; !nodeAfterText.isTextblock; nodeAfterText = nodeAfterText.firstChild!) {
      afterDepth++;
    }

    if(joinAtNode.canReplace(joinAtNode.childCount, joinAtNode.childCount, nodeAfterText.content)) {
      let wrapEnd = Fragment.empty;
      for(let i = wrap.length - 1; i >= 0; i--) {
        wrapEnd = Fragment.from(wrap[i].copy(wrapEnd));
      }

      const tr = state.tr.step(new ReplaceAroundStep($cut.pos - wrap.length, $cut.pos + nodeAfter.nodeSize,
                                                    $cut.pos + afterDepth, $cut.pos + nodeAfter.nodeSize - afterDepth,
                                                    new Slice(wrapEnd, wrap.length, 0/*use full Slice at End*/), 0/*move content to slice Start*/, true/*enforce right structure*/));
          tr.scrollIntoView();
      return tr/*updated*/;
    }
  } /* else -- could not replace */

  return false/*default*/;
};

// ................................................................................
// modify the Transaction of the given EditorState such that Nodes are Joined
// Deleted depending on whether a valid replacement can be performed
const joinMaybeClear = (state: EditorState, $pos: ResolvedPos) => {
  const nodeBefore = $pos.nodeBefore,
        nodeAfter = $pos.nodeAfter;
  const posIndex = $pos.index();

  if(!nodeBefore || !nodeAfter || !nodeBefore.type.compatibleContent(nodeAfter.type)) return false/*no valid Content*/;

  if(!nodeBefore.content.size && $pos.parent.canReplace(posIndex - 1, posIndex)) {
    return state.tr.delete($pos.pos - nodeBefore.nodeSize, $pos.pos).scrollIntoView();
  } /* else -- nodeBefore has Content, Content from index-1 to index can be replaced */

  if(!$pos.parent.canReplace(posIndex, posIndex + 1) || !(nodeAfter.isTextblock || canJoin(state.doc, $pos.pos))) {
    return false/* replacement cannot be performed, nodeAfter is not a Text Block or content can be joined*/;
  } /* else -- clear incompatible and join */

  return state.tr.clearIncompatible($pos.pos, nodeBefore.type, nodeBefore.contentMatchAt(nodeBefore.childCount))
                 .join($pos.pos)
                 .scrollIntoView();
};
