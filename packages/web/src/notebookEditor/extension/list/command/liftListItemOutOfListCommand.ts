import { Fragment, NodeRange, Slice } from 'prosemirror-model';
import { EditorState, Transaction } from 'prosemirror-state';
import { ReplaceAroundStep } from 'prosemirror-transform';

import { AbstractDocumentUpdate, Command, NodeName } from '@ureeka-notebook/web-service';

import { getListItemRange } from '../util';

// ********************************************************************************
// NOTE: these Commands are inspired by https://github.com/remirror/remirror/blob/f274e22d8e89821d33f1166bf35b1b776986ae4f/packages/remirror__extension-list/src/list-commands.ts
/**
 * lift the content inside a ListItem or a TaskListItem around the Selection
 * out of the List
 */
export const liftListItemOutOfListCommand = (itemTypeName: NodeName.LIST_ITEM | NodeName.TASK_LIST_ITEM): Command => (state, dispatch) => {
  const updatedTr = new LiftListItemOutOfListDocumentUpdate(itemTypeName).update(state, state.tr);
  if(updatedTr) {
    dispatch(updatedTr);
    return true/*Command executed*/;
  } /* else -- Command cannot be executed */

  return false/*not executed*/;
};
export class LiftListItemOutOfListDocumentUpdate implements AbstractDocumentUpdate {
  public constructor(private readonly itemTypeName: NodeName.LIST_ITEM | NodeName.TASK_LIST_ITEM) {/*nothing additional*/}

  /** modify the given Transaction such that the content of a ListItem or a
   * TaskListItem around the Selection is lifted out of the List
   */
  public update(editorState: EditorState, tr: Transaction) {
    const range = getListItemRange(this.itemTypeName, tr.selection);
    if(!range) return false/*block is not a ListItem or TaskListItem*/;

    const updatedTr = liftOutOfList(tr, range);
    return updatedTr/*updated*/;
  }
}
// REF: https://github.com/ProseMirror/prosemirror-schema-list/blob/master/src/schema-list.ts
const liftOutOfList = (tr: Transaction, range: NodeRange) => {
  const list = range.parent;
  const originMappingLength = tr.mapping.maps.length;

  // -- Merge ---------------------------------------------------------------------
  // merge the ListItems into a single big ListItem
  for(let position = range.end, i = range.endIndex - 1, e = range.startIndex; i > e; i--) {
    position -= list.child(i).nodeSize;
    tr.delete(position - 1, position + 1);
  }

  // -- Checks --------------------------------------------------------------------
  const $start = tr.doc.resolve(range.start),
        listItem = $start.nodeAfter;
  if(!listItem) return false/*no nodeAfter starting position, nothing to do*/;
  if(tr.mapping.slice(originMappingLength).map(range.end) !== range.start + listItem.nodeSize) return false/*invalid resulting state after Transaction*/;

  const isAtStart = range.startIndex === 0/*first index*/,
        isAtEnd = range.endIndex === list.childCount/*last index*/;
  const $startParentNode = $start.node(-1/*parentNode of $start*/),
        indexBefore = $start.index(-1/*index of $start into the ancestor at the $startParentNode level*/);

  if(!$startParentNode.canReplace(
    indexBefore + (isAtStart ? 0/*already at start*/ : 1/*set to the current Node index*/),
    indexBefore + 1/*set to the current Node index*/,
    listItem.content.append(isAtEnd ? Fragment.empty : Fragment.from(list)))
  ) return false/*invalid replacement*/;

  const listItemStart = $start.pos,
        listItemEnd = listItemStart + listItem.nodeSize;

  // -- Create Replace Step -------------------------------------------------------
  // strip off the surrounding List. At the sides where not at
  // the end of the List, the existing List is closed. At sides where
  // this is the end, it is overwritten to its end
  tr.step(
    new ReplaceAroundStep(
      listItemStart - (isAtStart ? 1/*account for start*/ : 0/*do not account*/),
      listItemEnd + (isAtEnd ? 1/*account for end*/ : 0/*do not account*/),
      listItemStart + 1/*gapFrom*/,
      listItemEnd - 1/*gapTo*/,
      new Slice(
        (isAtStart ? Fragment.empty : Fragment.from(list.copy(Fragment.empty))).append(isAtEnd ? Fragment.empty : Fragment.from(list.copy(Fragment.empty))),
        isAtStart ? 0/*no openStart*/ : 1/*openStart at 1*/,
        isAtEnd ? 0/*no openEnd*/ : 1/*openEnd at 1*/
      ),
      isAtStart ? 0/*insert at start*/ : 1/*insert with offset 1*/
    )
  );

  return tr.scrollIntoView()/*updated*/;
};
