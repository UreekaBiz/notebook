import { MarkName, NodeName } from '@ureeka-notebook/web-service';

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
  [NodeName.TEXT]: null/*none*/,
  [NodeName.HEADING]: HeadingToolbar,
  [NodeName.IMAGE]: ImageToolbar,
  [NodeName.LIST_ITEM]: ListItemToolbar,
  [NodeName.LIST_ITEM_CONTENT]: null/*none since User interacts with ListItem*/,
  [NodeName.MARK_HOLDER]: null/*none*/,
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

// --------------------------------------------------------------------------------
/**
 * @param nodeOrMarkName The name of the node or mark whose toolbar is being asked for
 * @returns The corresponding Toolbar for the given Node name
 */
export const getToolbar = (nodeOrMarkName: NodeName | MarkName): Toolbar | null => {
  let toolbar = TOOLBAR_MAP[nodeOrMarkName];
  return toolbar;
};
