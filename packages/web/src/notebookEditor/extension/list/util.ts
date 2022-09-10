import { callOrReturn, Editor, ExtendedRegExpMatchArray, InputRule, InputRuleFinder } from '@tiptap/core';
import { Node as ProseMirrorNode, NodeType, ResolvedPos } from 'prosemirror-model';
import { EditorState, Selection, Transaction } from 'prosemirror-state';
import { canJoin, findWrapping } from 'prosemirror-transform';

import { getAllAscendantsFromSelection, isBulletListNode, isDocumentNode, isOrderedListNode, isTaskListNode, isTaskListItemNode, isListItemNode, isListItemContentNode, AttributeType, NodeName, SelectionDepth, SetTextSelectionDocumentUpdate } from '@ureeka-notebook/web-service';

import { applyDocumentUpdates } from 'notebookEditor/command/update';

import { SetParagraphDocumentUpdate } from '../paragraph/command';
import { ToggleListDocumentUpdate } from './command/toggleListCommand';
import { SetListItemContentDocumentUpdate, ALLOW_LIST_ITEM_CONTENT_META } from './listItemContent/update';

// ********************************************************************************
// == List ========================================================================
// -- Node ------------------------------------------------------------------------
/** Checks whether the given {@link ProseMirrorNode} is a List Node */
export const isListNode = (node: ProseMirrorNode) => isBulletListNode(node) || isOrderedListNode(node) || isTaskListNode(node);

/**
 * Checks whether the given {@link ProseMirrorNode} is a Node whose behavior or
 * functionality relates to Lists
 */
export const isListBlockNode = (node: ProseMirrorNode) => isListNode(node) || isListItemNode(node) || isListItemContentNode(node);

// -- Update ----------------------------------------------------------------------
/**
 * ensures the correct behavior is followed by both ToolItems and Keyboard
 * Shortcuts given the constraints imposed by the fact that ListItemContent is
 * used as the Content of List Nodes instead of a Paragraph. If startingAnchor
 * is passed, it will be used as the starting position for the Selection when the
 * DocumentUpdates are executed
 */
 export const handleListDocumentUpdates = (editor: Editor, listTypeName: NodeName.ORDERED_LIST | NodeName.BULLET_LIST | NodeName.TASK_LIST, startingAnchor?: number) => {
  const toggleListUpdate = new ToggleListDocumentUpdate(listTypeName, startingAnchor);

  // ensure that toggling Lists either through Keyboard Shortcuts or ToolItems
  // does not leave a ListItemContent Node as a direct child of the Document by
  // checking for the case when there is a top level List with only one ListItem
  // that gets toggled
  const { selection  } = editor.state;
  const { $anchor, anchor } = selection;
  if(isListItemContentNode($anchor.parent) && $anchor.depth === 3/*anchor inside a ListItemContent Node, inside a ListItem, inside a List*/) {
    return applyDocumentUpdates(editor, [ toggleListUpdate, new SetParagraphDocumentUpdate() ]);
  } else {
    // ensure that the List Commands work correctly by first setting the ListItemContent
    // so that it can be wrapped
    return applyDocumentUpdates(editor, [
      new SetListItemContentDocumentUpdate(),
      toggleListUpdate,

      // do not modify Selection if Toggling for the first time
      // otherwise, this call comes from a nested ToolItem
      ...(isDocumentNode($anchor.node(-1/*$anchors grandParent*/)) ? [] : [new SetTextSelectionDocumentUpdate({ from: anchor, to: anchor })]),
    ]
    );
  }
};

// -- Join ------------------------------------------------------------------------
/**
 * modify the given Transaction such that the Nodes starting at the depth
 * of the given ResolvedPos and going upwards through their ancestors are
 * joined together if possible
 */
export const maybeJoinList = (tr: Transaction, $pos?: ResolvedPos): boolean => {
  const $from = $pos || tr.selection.$from/*default*/;

  // holds the positions of the List Nodes that can be joined
  let joinable: number[] = []/*default empty*/;

  let index: number;
  let parent: ProseMirrorNode;
  let before: ProseMirrorNode | null | undefined,
      after: ProseMirrorNode | null | undefined;
  for(let depth = $from.depth; depth >= 0; depth--) {
    parent = $from.node(depth);

    // check nodes that can be joined backward
    index = $from.index(depth);
    before = parent.maybeChild(index - 1);
    after = parent.maybeChild(index);

    if(before && after && before.type.name === after.type.name && isListNode(before)) {
      const pos = $from.before(depth + 1);
      joinable.push(pos);
    }

    // check nodes that can be joined forward
    index = $from.indexAfter(depth);
    before = parent.maybeChild(index - 1);
    after = parent.maybeChild(index);

    if(before && after && before.type.name === after.type.name && isListNode(before)) {
      const pos = $from.after(depth + 1);
      joinable.push(pos);
    }
  }

  // sort joinable positions in reverse
  joinable = [...new Set(joinable)].sort((a, b) => b - a/*reverse order of default sort*/);

  // check that all positions can be joined
  let updated = false/*default*/;
  for(const pos of joinable) {
    if(canJoin(tr.doc, pos)) {
      tr.join(pos);
      updated = true;
    }
  }

  return updated/*Transaction was successfully modified*/;
};

// == Toolbar =====================================================================
/** ensure ToolItems display correctly inside Lists */
export const shouldShowToolItemInsideList = (state: EditorState, depth: SelectionDepth) => {
  // default to accounting for immediate Node depth (undefined), parent Node
  // (ListItemContent) and grand parent Node (ListItem)
  let showToolItemsOffset = 3/*(SEE: comment above)*/;

  return depth === getAllAscendantsFromSelection(state).length -  showToolItemsOffset;
};

// == Depth =======================================================================
/**
 * receives a SelectionDepth and returns the parent List at that depth, its
 * position, as well as the first ListItem or TaskListItem at that depth
 * and its position. This is meant to be used by the Commands executed
 * by ToolItems that are shown in nested Lists so that the right
 * ranges are updated by them
  */
export const getListNodesFromDepth = (editorState: EditorState, depth: SelectionDepth) => {
  if(!depth) return/*nothing to do*/;
  const { selection } = editorState;

  const parentListDepth = depth - 1/*since 'depth' is the ListItem depth*/;
  const anchorIndexIntoList = selection.$anchor.index(parentListDepth);

  const listAtDepthPos = selection.$anchor.posAtIndex(anchorIndexIntoList, parentListDepth),
        listAtDepth = editorState.doc.nodeAt(listAtDepthPos);

  const listItemAtDepth = listAtDepth?.firstChild/*by definition*/,
        listItemAtDepthPos = listAtDepthPos + 1/*first position inside the List, ListItem by contract*/;

  if( !listAtDepth || !isListNode(listAtDepth)
   || !listItemAtDepth || !(isListItemNode(listItemAtDepth)
   || isTaskListItemNode(listItemAtDepth))
  ) return/*invalid conditions*/;

  return { listAtDepthPos, listAtDepth, listItemAtDepth, listItemAtDepthPos };
};

// == Range =======================================================================
/* Returns the NodeRange covered by a ListItem or a TaskListItem  */
export const getListItemRange = (listItemTypeName: NodeName.LIST_ITEM | NodeName.TASK_LIST_ITEM, selection: Selection) => {
  const { $from, $to } = selection;
  const range = $from.blockRange($to, (node) => {
    const { firstChild } = node;
    if(!firstChild) return false/*nothing to do*/;

    return firstChild.type.name === listItemTypeName;
  });

  return range;
};

// == Input =======================================================================
// REF: https://github.com/ueberdosis/tiptap/blob/8c6751f0c638effb22110b62b40a1632ea6867c9/packages/core/src/inputRules/wrappingInputRule.ts
// NOTE: using custom wrappingInputRule since the current Block must be
//       turned into a ListItemContent Node so that it gets wrapped
//       by the List DocumentUpdates (SEE: ./listItemContent/plugin.ts)
type ListInputRuleProps = {
  find: InputRuleFinder;
  type: NodeType;
  getAttributes?: (match: ExtendedRegExpMatchArray) => Partial<Record<AttributeType, any>>;
  joinPredicate?: (match: ExtendedRegExpMatchArray, node: ProseMirrorNode) => boolean;
}
export const getWrappingListInputRule = ({ find, type, getAttributes, joinPredicate }: ListInputRuleProps) => {
  return new InputRule({
    find,
    handler: ({ state, range, match }) => {
      const attributes = callOrReturn(getAttributes, undefined/*no context*/, match) || {/*default to no attrs*/};
      const updatedTr = new SetListItemContentDocumentUpdate().update(state, state.tr)
                            .setMeta(ALLOW_LIST_ITEM_CONTENT_META, true/*(SEE: NOTE above)*/)
                            .delete(range.from, range.to);
      const $start = updatedTr.doc.resolve(range.from);
      const blockRange = $start.blockRange();
      const wrapping = blockRange && findWrapping(blockRange, type, attributes);

      if(!wrapping) {
        return null/*do not apply Transaction*/;
      } /* else -- valid wrapping found */

      updatedTr.wrap(blockRange, wrapping);
      const nodeBefore = updatedTr.doc.resolve(range.from - 1).nodeBefore;

      if(nodeBefore &&
        nodeBefore.type === type /*nodeBefore in found wrapping matches List type*/ &&
        canJoin(updatedTr.doc, range.from - 1/*nodeBefore pos*/) &&
        (!joinPredicate || joinPredicate(match, nodeBefore))
      ) {
        updatedTr.join(range.from - 1);
      } /* else -- do not apply Transaction */

      return/*nothing left to do*/;
    },
  });
};
