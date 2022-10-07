import { Editor } from '@tiptap/core';

import { MarkName, NodeName, SelectionDepth } from '@ureeka-notebook/web-service';

import { CodeBlockToolbar } from 'notebookEditor/extension/codeblock/toolbar';
import { CodeBlockReferenceToolbar } from 'notebookEditor/extension/codeBlockReference/toolbar';
import { Demo2AsyncNodeToolbar } from 'notebookEditor/extension/demo2AsyncNode/toolbar';
import { DemoAsyncNodeToolbar } from 'notebookEditor/extension/demoAsyncNode/toolbar';
import { DocumentToolbar } from 'notebookEditor/extension/document/toolbar';
import { HeadingToolbar } from 'notebookEditor/extension/heading/toolbar';
import { ImageToolbar } from 'notebookEditor/extension/image/toolbar';
import { LinkToolbar } from 'notebookEditor/extension/link/toolbar';
import { BulletListToolbar } from 'notebookEditor/extension/list/bulletList/toolbar';
import { ListItemToolbar } from 'notebookEditor/extension/list/listItem/toolbar';
import { OrderedListToolbar } from 'notebookEditor/extension/list/orderedList/toolbar';
import { TaskListToolbar } from 'notebookEditor/extension/list/taskList/toolbar';
import { TaskListItemToolbar } from 'notebookEditor/extension/list/taskListItem/toolbar';
import { EditableInlineNodeWithContentToolbar } from 'notebookEditor/extension/nestedViewNode/editableInlineNodeWithContent/toolbar';
import { NestedViewBlockNodeToolbar } from 'notebookEditor/extension/nestedViewNode/nestedViewBlockNode/toolbar';
import { ParagraphToolbar } from 'notebookEditor/extension/paragraph/toolbar';

import { Toolbar } from './type';

// ********************************************************************************
// A collection of Toolbars. Each Node can have its own Toolbar. If it's not defined
// in the collection then nothing will be shown.
const TOOLBAR_MAP: Record<NodeName | MarkName, Toolbar | null> = {
  [NodeName.BULLET_LIST]: BulletListToolbar,
  [NodeName.CODEBLOCK]: CodeBlockToolbar,
  [NodeName.CODEBLOCK_REFERENCE]: CodeBlockReferenceToolbar,
  [NodeName.DEMO_2_ASYNC_NODE]: Demo2AsyncNodeToolbar,
  [NodeName.DEMO_ASYNC_NODE]: DemoAsyncNodeToolbar,
  [NodeName.DOC]: DocumentToolbar,
  [NodeName.EDITABLE_INLINE_NODE_WITH_CONTENT]: EditableInlineNodeWithContentToolbar,
  [NodeName.TEXT]: null/*none*/,
  [NodeName.HEADING]: HeadingToolbar,
  [NodeName.IMAGE]: ImageToolbar,
  [NodeName.LIST_ITEM]: ListItemToolbar,
  [NodeName.LIST_ITEM_CONTENT]: null/*none since User interacts with ListItem*/,
  [NodeName.MARK_HOLDER]: null/*none*/,
  [NodeName.NESTED_VIEW_BLOCK_NODE]: NestedViewBlockNodeToolbar,
  [NodeName.ORDERED_LIST]: OrderedListToolbar,
  [NodeName.PARAGRAPH]: ParagraphToolbar/*none*/,
  [NodeName.TASK_LIST]: TaskListToolbar,
  [NodeName.TASK_LIST_ITEM]: TaskListItemToolbar,

  [MarkName.BOLD]: null/*none*/,
  [MarkName.CODE]: null/*none*/,
  [MarkName.ITALIC]: null/*none*/,
  [MarkName.LINK]: LinkToolbar/*none*/,
  [MarkName.REPLACED_TEXT_MARK]: null/*none*/,
  [MarkName.STRIKETHROUGH]: null/*none*/,
  [MarkName.SUB_SCRIPT]: null/*none*/,
  [MarkName.SUPER_SCRIPT]: null/*none*/,
  [MarkName.TEXT_STYLE]: null/*none*/,
  [MarkName.UNDERLINE]: null/*none*/,

};

// == Util ========================================================================
/**
 * @param nodeOrMarkName The name of the node or mark whose toolbar is being asked for
 * @returns The corresponding Toolbar for the given Node name
 */
 export const getToolbar = (nodeOrMarkName: NodeName | MarkName): Toolbar | null => {
  let toolbar = TOOLBAR_MAP[nodeOrMarkName];
  return toolbar;
};

/**
 * decide whether the Toolbar or the ToolbarBreadcrumbItem should be shown for a
 * given Node by checking the properties of its Toolbar object
 */
export const shouldShowToolbarOrBreadcrumb = (editor: Editor, toolbar: Toolbar, depth: SelectionDepth): boolean => {
  // if at least one Tool in the ToolCollection does not have the shouldShow
  // property defined, or if at least one of the Tools that have it should be
  // shown, show the Toolbar or BreadcrumbItem
  const shouldShow = toolbar.toolsCollections.some(toolCollection =>
    toolCollection.some(tool => !tool.shouldShow || (tool.shouldShow(editor, depth))));

  return shouldShow;
};

