import { Slice, Fragment, NodeType, NodeRange } from 'prosemirror-model';
import { EditorState, Transaction } from 'prosemirror-state';
import { canSplit, findWrapping, liftTarget, ReplaceAroundStep } from 'prosemirror-transform';

import { isListItemNode, isListItemNodeType, AbstractDocumentUpdate, Attributes, AttributeType, Command } from '@ureeka-notebook/web-service';

// ********************************************************************************
// REF: https://github.com/ProseMirror/prosemirror-schema-list/blob/master/src/schema-list.ts

// -- Wrap ------------------------------------------------------------------------
/** wrap the Selection in a List with the given Type and Attributes */
export const wrapInListCommand = (listType: NodeType, attrs: Attributes | undefined = undefined): Command => (state, dispatch) => {
  const updatedTr = new WrapInListDocumentUpdate(listType, attrs).update(state, state.tr);
  if(updatedTr) {
    dispatch(updatedTr);
    return true/*Command executed*/;
  } /* else -- Command cannot be executed */

  return false/*not executed*/;
};
export class WrapInListDocumentUpdate implements AbstractDocumentUpdate {
  public constructor(private readonly listType: NodeType, private readonly attrs: Attributes | undefined = undefined) {/*nothing additional*/}

  /**
   * modify the given Transaction such that the Selection is wrapped in a List with the
   * given Type and Attributes, and return it
   */
  public update(editorState: EditorState, tr: Transaction) {
    const { $from, $to } = editorState.selection;
    let range = $from.blockRange($to)/*default*/;
    if(!range) return false/*no valid starting Range, do nothing*/;

    let doJoin = false/*default*/;
    let outerRange = range/*default*/;

    // @ts-ignore even though compatibleContent is not defined on the type of the
    //            Node, the property does exist. This may be due to a mismatch in
    //            the versions of prosemirror-model
    // check if at the top of an existing List Item
    if(range.depth >= 2 && $from.node(range.depth - 1).type.compatibleContent(this.listType) && range.startIndex == 0) {
      if($from.index(range.depth - 1) === 0) return false/*at the top of the List, do nothing*/;

      const $insert = editorState.doc.resolve(range.start - 2);
      outerRange = new NodeRange($insert, $insert, range.depth);

      if(range.endIndex < range.parent.childCount) {
        range = new NodeRange($from, editorState.doc.resolve($to.end(range.depth)), range.depth);
      } /* else -- valid range */

      doJoin = true/*join the Nodes*/;
    }
    const wrappers = findWrapping(outerRange, this.listType, this.attrs, range);
    if(!wrappers) return false/*no valid outer wrapping found*/;

    const updatedTr = doWrapInList(editorState.tr, range, wrappers, doJoin, this.listType).scrollIntoView();
    return updatedTr/*updated*/;
  }
}
const doWrapInList = (tr: Transaction, range: NodeRange, wrappers: { type: NodeType; attrs?: Attributes | null; }[], joinBefore: boolean, listType: NodeType) => {
  // ensure the ListItems in wrappers have the same
  // attributes (which affect the style) their closest sibling ListItem
  const { parent: grandParentListItem } = range;
  const parentList = grandParentListItem.lastChild;
  const closestSiblingListItem = parentList?.lastChild;

  if(parentList && closestSiblingListItem && isListItemNode(closestSiblingListItem)) {
    for(let i=0; i<wrappers.length; i++) {
      if(isListItemNodeType(wrappers[i].type)) {
        wrappers[i].attrs = { ...closestSiblingListItem.attrs };
      } /* else -- do not modify wrapper attributes */
    }
  } /* else -- wrappers will use default attributes */

  // wrap the content with the given wrappers
  let content = Fragment.empty;
  for(let i=wrappers.length - 1; i>=0; i--) {
    content = Fragment.from(wrappers[i].type.create(wrappers[i].attrs, content));
  }
  tr.step(new ReplaceAroundStep(range.start - (joinBefore ? 2 : 0), range.end, range.start, range.end, new Slice(content, 0, 0), wrappers.length, true));

  // compute offset for splitDepth
  let found = 0/*default*/;
  for(let i=0; i<wrappers.length; i++) {
    if(wrappers[i].type == listType) {
      found = i + 1;
    } /* else -- not of the same type, do not change found offset */
  }
  const splitDepth = wrappers.length - found;

  // split at depth
  let splitPos = range.start + wrappers.length - (joinBefore ? 2/*account for Node before*/ : 0/*do not account*/);
  for(let i=range.startIndex, e=range.endIndex, first = true; i < e; i++, first = false) {
    if(!first && canSplit(tr.doc, splitPos, splitDepth)) {
      tr.split(splitPos, splitDepth);
      splitPos += 2 * splitDepth;
    }
    splitPos += grandParentListItem.child(i).nodeSize;
  }

  return tr/*updated*/;
};

// -- Lift ------------------------------------------------------------------------
// lift the ListItem around the Selection uo into a wrapping List
export const liftListItemCommand = (listItemType: NodeType): Command => (state, dispatch) => {
  const updatedTr = new LiftListItemDocumentUpdate(listItemType).update(state, state.tr);
  if(updatedTr) {
    dispatch(updatedTr);
    return true/*Command executed*/;
  } /* else -- Command cannot be executed */

  return false/*not executed*/;
};
export class LiftListItemDocumentUpdate implements AbstractDocumentUpdate {
  public constructor(private readonly listItemType: NodeType) {/*nothing additional*/}

  public update(editorState: EditorState, tr: Transaction) {
    const { $from, $to } = editorState.selection;

    const range = $from.blockRange($to, node => node.childCount > 0/*not empty*/ && node.firstChild!.type == this.listItemType);
    if(!range) return false;

    const nearestListItem = $from.node(range.depth - 1);
    if(nearestListItem.type == this.listItemType) {
      // inside a parent List, ensure lifted ListItems inherit the style
      // of their new ListItem parent, by computing the depth
      // at which the style should be copied
      tr.doc.nodesBetween(range.$from.pos, range.$to.pos, (node, pos) => {
        const { depth: nodeDepth } = tr.doc.resolve(pos);
        const liftedDepth = tr.selection.$from.depth-2/*account for ListItemContent and ListItem*/;

        if(isListItemNode(node) && (nodeDepth === liftedDepth)) {
          tr.setNodeMarkup(pos, undefined/*maintain type*/, { ...node.attrs, [AttributeType.ListStyleType]: nearestListItem.attrs[AttributeType.ListStyleType] });
        } /* else -- ignore */
      });
      return liftToOuterList(tr, this.listItemType, range);
    } else {
      // outer List node
      return liftOutOfList(tr, range);
    }
  }
}
const liftToOuterList = (tr: Transaction, itemType: NodeType, range: NodeRange) => {
  const end = range.end;
  const endOfList = range.$to.end(range.depth);

  if(end < endOfList) {
    // there are siblings after the lifted items, which must become
    // children of the lifted item
    const liftedItemsSlice = new Slice(Fragment.from(itemType.create(null, range.parent.copy())), 1, 0);
    tr.step(new ReplaceAroundStep(end - 1, endOfList, end, endOfList, liftedItemsSlice, 1, true));
    range = new NodeRange(tr.doc.resolve(range.$from.pos), tr.doc.resolve(endOfList), range.depth);
  } /* else -- FIXME */

  const target = liftTarget(range);
  if(target == null) return false/*no target Depth to which the Content in Range can be lifted found*/;

  tr.lift(range, target).scrollIntoView();

  return tr/*updated*/;
};
const liftOutOfList = (tr: Transaction, range: NodeRange) => {
  const list = range.parent;

  // merge the ListItem into a single big ListItem
  for(let pos=range.end, i=range.endIndex - 1, e=range.startIndex; i>e; i--) {
    pos -= list.child(i).nodeSize;
    tr.delete(pos - 1, pos + 1);
  }

  const $start = tr.doc.resolve(range.start);
  const listItem = $start.nodeAfter!;
  if(tr.mapping.map(range.end) != range.start + $start.nodeAfter!.nodeSize) return false/*invalid resulting state*/;

  const atStart = range.startIndex == 0, atEnd = range.endIndex == list.childCount;
  const parent = $start.node(-1/*parent of $start*/);
  const indexBefore = $start.index(-1/*index of parent of $start*/);
  if(!parent.canReplace(indexBefore + (atStart ? 0 : 1), indexBefore + 1, listItem.content.append(atEnd ? Fragment.empty : Fragment.from(list)))) return false/*invalid replacement*/;

  const start = $start.pos,
        end = start + listItem.nodeSize;

  // strip off the surrounding List. At the sides where not at
  // the end of the List, the existing List is closed. At sides where
  // this is the end, it is overwritten to its end.
  tr.step(new ReplaceAroundStep(start - (atStart ? 1 : 0), end + (atEnd ? 1 : 0), start + 1, end - 1,
                                new Slice((atStart ? Fragment.empty : Fragment.from(list.copy(Fragment.empty)))
                                          .append(atEnd ? Fragment.empty : Fragment.from(list.copy(Fragment.empty))),
                                          atStart ? 0 : 1, atEnd ? 0 : 1), atStart ? 0 : 1))
    .scrollIntoView();

  return tr/*updated*/;
};
