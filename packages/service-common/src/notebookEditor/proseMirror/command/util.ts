import { ContentMatch, Fragment, Node as ProseMirrorNode, ResolvedPos, Slice } from 'prosemirror-model';
import { EditorState, Selection } from 'prosemirror-state';
import { canJoin, liftTarget, ReplaceAroundStep } from 'prosemirror-transform';

// ********************************************************************************
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

  return null;
};


// ................................................................................
// try to Join or Delete the Nodes backwards given the $cut ResolvedPos.
// If this is not possible, try to Join or Delete forwards by performing an
// adequate replacement
export const deleteBarrier = (state: EditorState, $cut: ResolvedPos) => {
  const nodeBefore = $cut.nodeBefore!;
  const nodeAfter = $cut.nodeAfter!;
  let conn;
  let match;
  if(nodeBefore.type.spec.isolating || nodeAfter.type.spec.isolating) return false/*do not check*/;

  const joinMaybeClearUpdatedTr = joinMaybeClear(state, $cut);
  if(joinMaybeClearUpdatedTr) {
    return joinMaybeClearUpdatedTr/*updated*/;
  } /* else -- did not join or cleared */

  const canDelAfter = $cut.parent.canReplace($cut.index(), $cut.index() + 1);
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
// modify the Transaction of the given EditorState such that Nodes are Joined
// Deleted depending on whether a valid replacement can be performed
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
