import { Fragment, NodeType, Slice } from 'prosemirror-model';
import { EditorState, Selection, Transaction } from 'prosemirror-state';
import { canSplit } from 'prosemirror-transform';

import { isNodeSelection, AbstractDocumentUpdate, AttributeType, Command, NodeName } from '@ureeka-notebook/web-service';

// ********************************************************************************
// NOTE: this is inspired by https://github.com/remirror/remirror/blob/f274e22d8e89821d33f1166bf35b1b776986ae4f/packages/remirror__extension-list/src/list-commands.ts

// == Type ========================================================================
// the types of the Nodes that will be set after the split point
type TypeAfter = { type: NodeType; attrs: any; } | null;
type TypesAfter = TypeAfter[];

// == Command =====================================================================
/**
 * split a non-empty Text Block at the top level of a ListItem by also
 * splitting that ListItem
 */
export const splitListItemCommand = (listItemTypeOrName: NodeName.LIST_ITEM | NodeName.TASK_LIST_ITEM): Command => (state, dispatch) => {
  const updatedTr = new SplitListItemDocumentUpdate(listItemTypeOrName).update(state, state.tr);
  if(updatedTr) {
    dispatch(updatedTr);
    return true/*Command executed*/;
  } /* else -- Command cannot be executed */

  return false/*not executed*/;
};
export class SplitListItemDocumentUpdate implements AbstractDocumentUpdate {
  public constructor(private readonly listItemName: NodeName.LIST_ITEM | NodeName.TASK_LIST_ITEM) {/*nothing additional*/ }

  /**
   * modify the Transaction such that a non-empty Text Block at the top level
   * of a ListItem is split, and return it
   */
  public update(editorState: EditorState, tr: Transaction) {
    const listItemType = editorState.schema.nodes[this.listItemName];
    const { $from, $to } = tr.selection;

    if((isNodeSelection(tr.selection) && tr.selection.node.isBlock)/*selected Node is a Block*/ ||
      $from.depth < 2 /*ListItems can only exist at depth > 2*/ ||
      !$from.sameParent($to)/*do not allow Command to run if Selection spans multiple Nodes*/
    ) return false/*non valid conditions for execution*/;

    // ensure grandparent is of the same type as the ListItem type
    const grandParent = $from.node(-1/*grandParent depth*/);
    if(grandParent.type !== listItemType) return false/*not of the same type*/;

    // if in an empty Block
    if($from.parent.content.size === 0 && $from.node(-1/*grandParent*/).childCount === $from.indexAfter(-1/*grandParent index*/)) {
      if($from.depth === 2/*explicit depth check*/ || $from.node(-3/*expected ListWrap depth*/).type !== listItemType || $from.index(-2/*great grandParent depth*/) !== $from.node(-2/*great grandParent depth*/).childCount - 1/*account for depths*/) return false/*not in a nested List*/;
      /* else -- split the wrapping ListItem */

      // build a Fragment containing empty versions of the structure
      // from the outer ListItem to the parent Node of the cursor
      const keepItem = $from.index(-1/*grandParent*/) > 0;
      let wrapping = Fragment.empty;
      for(let depth = $from.depth - (keepItem ? 1 : 2); depth >= $from.depth - 3; depth--) {
        wrapping = Fragment.from($from.node(depth).copy(wrapping));
      }

      // copy the attributes of the latest ListItem in the wrapping so that the new
      // ListItem matches them (hence maintaining styles for OrderedLists, for example)
      const content = listItemType.contentMatch.defaultType?.createAndFill() || undefined/*required by type*/,
            contentAttributes = { ...wrapping.child(wrapping.childCount - 1/*last child, account for 0 indexing*/).attrs };
      wrapping = wrapping.append(Fragment.from(listItemType.createAndFill(contentAttributes, content) || undefined/*required by type*/));

      // replace
      let resultingDepthAfter: number;
      if($from.indexAfter(-1/*grandParent depth*/) < $from.node(-2/*great grandParent*/).childCount) {
        resultingDepthAfter = 1;
      } else {
        if($from.indexAfter(-2/*great grandParent depth*/) < $from.node(-3/*great-great grandParent*/).childCount) {
          resultingDepthAfter = 2;
        } else {
          resultingDepthAfter = 3;
        }
      }
      tr.replace($from.before(keepItem ? undefined : -1/*grandParent depth*/), $from.after(-resultingDepthAfter), new Slice(wrapping, keepItem/*openStart*/ ? 3 : 2, 2/*openEnd*/))
        .setSelection(Selection.near(tr.doc.resolve($from.pos + (keepItem ? 3/*item was kept*/ : 2/*not kept*/))))
        .scrollIntoView();

      return tr/*updated*/;
    } /* else -- not in an empty Block */

    const listItemAttributes = Object.fromEntries(Object.entries(grandParent.attrs));
    // ensure new TaskListItems do not inherit the checked attribute from their parent
    if(listItemAttributes[AttributeType.Checked]) {
      listItemAttributes[AttributeType.Checked] = false/*prevent inheriting the attribute*/;
    } /* else -- not creating a new TaskListItem, do not modify attributes */

    // the content placed inside the split ListItem
    const contentType = $to.pos === $from.end() ? grandParent.contentMatchAt(0).defaultType : null/*no content*/;
    const contentAttributes = { ...$from.node().attrs };

    tr.delete($from.pos, $to.pos);
    if(!canSplit(tr.doc, $from.pos, 2)) return false/*splitting at position is not allowed*/;

    let types: TypesAfter;
    if(contentType) {
      types = [{ type: listItemType, attrs: listItemAttributes }, { type: contentType, attrs: contentAttributes }];
    } else {
      types = [{ type: listItemType, attrs: listItemAttributes }];
    }

    tr.split($from.pos, 2/*split at depth 2*/, types)
      .scrollIntoView();
    return tr/*updated*/;
  }
}
