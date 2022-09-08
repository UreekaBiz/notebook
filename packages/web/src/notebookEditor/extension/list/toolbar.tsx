import { Editor } from '@tiptap/core';
import { AiOutlinePlus } from 'react-icons/ai';
import { BsListTask } from 'react-icons/bs';
import { MdFormatListBulleted } from 'react-icons/md';
import { RiListOrdered } from 'react-icons/ri';
import { Node as ProseMirrorNode } from 'prosemirror-model';

import { getParentNode, isBulletListNode, isListItemContentNode, isNodeSelection, isOrderedListNode, isParagraphNode, isTaskListNode, NodeName, SelectionDepth, SetTextSelectionDocumentUpdate } from '@ureeka-notebook/web-service';

import { applyDocumentUpdates } from 'notebookEditor/command/update';
import { ToolItem } from 'notebookEditor/toolbar/type';

import { SplitListItemDocumentUpdate } from './command/splitListItemCommand';
import { IndentListDocumentUpdate } from './keyboardShortcut/indent';
import { getListNodesFromDepth, handleListDocumentUpdates, isListNode } from './util';

// ********************************************************************************
// NOTE: this is in a separate file so that there are no circular dependency
//       errors for the List Node toolbars

// -- Ordered List ----------------------------------------------------------------
export const orderedListToolItem: ToolItem = {
  toolType: 'button',
  name: NodeName.ORDERED_LIST,
  label: NodeName.ORDERED_LIST,

  icon: <RiListOrdered size={16} />,
  tooltip: 'Ordered List (⌘ + Shift + 7)',

  isActive: (editor, depth) => isListToolItemActive(editor, depth, isOrderedListNode),
  shouldShow: (editor, depth) => shouldShowListToolItem(editor, depth),
  shouldBeDisabled: (editor) => {
    const { selection } = editor.state;
    if(isNodeSelection(selection)) return true/*disabled*/;
    if(isParagraphNode(selection.$anchor.parent) || isListItemContentNode(selection.$anchor.parent)) return false/*enabled*/;
    /* else -- selection somewhere that does not allow bullet list */

    return true/*disabled*/;
  },
  onClick: (editor, depth) => listItemOnClick(editor, depth, NodeName.ORDERED_LIST),
};

// -- Bullet List -----------------------------------------------------------------
export const bulletListToolItem: ToolItem = {
  toolType: 'button',
  name: NodeName.BULLET_LIST,
  label: NodeName.BULLET_LIST,

  icon: <MdFormatListBulleted size={16} />,
  tooltip: 'Bullet List (⌘ + Shift + 8)',

  isActive: (editor, depth) => isListToolItemActive(editor, depth, isBulletListNode),
  shouldShow: (editor, depth) => shouldShowListToolItem(editor, depth),
  shouldBeDisabled: (editor) => {
    const { selection } = editor.state;
    if(isNodeSelection(selection)) return true/*disabled*/;

    // Only enable tool if the parent of the selected node is a paragraph node.
    if(isParagraphNode(selection.$anchor.parent) || isListItemContentNode(selection.$anchor.parent)) return false/*enabled*/;
    /* else -- selection somewhere that does not allow bullet list */

    return true/*disabled*/;
  },
  onClick: (editor, depth) => listItemOnClick(editor, depth, NodeName.BULLET_LIST),
};

// -- Task List -------------------------------------------------------------------
export const taskListToolItem: ToolItem = {
  toolType: 'button',
  name: NodeName.TASK_LIST,
  label: NodeName.TASK_LIST,

  icon: <BsListTask size={16} />,
  tooltip: 'Task List (⌘ + Shift + 9)',

  isActive: (editor, depth) => isListToolItemActive(editor, depth, isTaskListNode),
  shouldShow: (editor, depth) => shouldShowListToolItem(editor, depth),
  shouldBeDisabled: (editor) => {
    const { selection } = editor.state;
    if(isNodeSelection(selection)) return true/*disabled*/;
    if(isParagraphNode(selection.$anchor.parent) || isListItemContentNode(selection.$anchor.parent)) return false/*enabled*/;
    /* else -- selection somewhere that does not allow task list */

    return true/*disabled*/;
  },
  onClick: (editor, depth) => listItemOnClick(editor, depth, NodeName.TASK_LIST),
};

// -- New List --------------------------------------------------------------------
export const startNewListToolItem: ToolItem = {
  toolType: 'button',
  name: 'startNewListToolItem',
  label: 'startNewListToolItem',

  icon: <AiOutlinePlus size={16} />,
  tooltip: 'Start New List',

  isActive: (editor, depth) => false/*since this ToolItem is List-Node agnostic, it cannot be 'active'*/,
  shouldShow: (editor, depth) => shouldShowListToolItem(editor, depth),
  shouldBeDisabled: (editor, depth) => !shouldShowListToolItem(editor, depth)/*same conditions as shouldShow, with adjusted logic*/,

  // add a new List at the end of the current one. This is the equivalent of going
  // to the end of the List and pressing Enter and Tab afterwards
  onClick: (editor, depth) => {
    const listNodesAtDepth = getListNodesFromDepth(editor.state, depth);
    if(!listNodesAtDepth) return false/*no valid conditions to create new List*/;

    const { listAtDepth, listAtDepthPos, listItemAtDepth } = listNodesAtDepth;

    const endOfList = listAtDepthPos + listAtDepth.nodeSize - 3/*account for end of ListItemContent, ListItem and List*/;
    return applyDocumentUpdates(editor, [
      new SetTextSelectionDocumentUpdate({ from: endOfList, to: endOfList }),

      // simulate Enter keypress
      new SplitListItemDocumentUpdate(listItemAtDepth.type.name as (NodeName.LIST_ITEM | NodeName.TASK_LIST_ITEM)/*by contract*/),

      // simulate Tab keypress
      new IndentListDocumentUpdate(),
    ]);
  },
};

// -- Util ------------------------------------------------------------------------
// return whether the ToolItem for the List is active at the given Depth
const isListToolItemActive = (editor: Editor, depth: SelectionDepth, isListNodeValidationFunction: (node: ProseMirrorNode) => boolean) => {
  const listNodesAtDepth = getListNodesFromDepth(editor.state, depth);
  if(!listNodesAtDepth) return false/*invalid depth*/;

  const { listAtDepth } = listNodesAtDepth;
  if(!isListNode(listAtDepth)) return false/*wrong Node type*/;

  return isListNodeValidationFunction(listAtDepth);
};

// return whether the ToolItem for the List should be shown at the given Depth
export const shouldShowListToolItem = (editor: Editor, depth: SelectionDepth) => {
  const { selection } = editor.state;
  if(isListItemContentNode(getParentNode(selection)) &&
    selection.empty/*since ToolItems correspond to a specific depth, do not show if multiple Nodes selected*/) {
    return true/*inside ListItemContent*/;
  } /* else -- not inside ListItemContent */

  return depth === undefined || selection.$anchor.depth === depth;/*direct parent*/
};

const listItemOnClick = (editor: Editor, depth: SelectionDepth, listTypeName: NodeName.BULLET_LIST | NodeName.ORDERED_LIST | NodeName.TASK_LIST) => {
  let startingAnchorPos: number | undefined = undefined/*use normal anchor by default*/;
  const listNodesAtDepth = getListNodesFromDepth(editor.state, depth);
  if(listNodesAtDepth) {
    startingAnchorPos = listNodesAtDepth.listItemAtDepthPos + 1/*inside the ListItem, in its ListItemContent*/;
  } /* else -- do not change default */

  return handleListDocumentUpdates(editor, listTypeName, startingAnchorPos);
};