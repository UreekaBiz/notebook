import { MarkName, NodeName } from '@ureeka-notebook/web-service';

import { DocumentToolbar } from 'notebookEditor/extension/document/toolbar';
import { HeadingToolbar } from 'notebookEditor/extension/heading/toolbar';
import { ImageToolbar } from 'notebookEditor/extension/image/toolbar';
import { LinkToolbar } from 'notebookEditor/extension/link/toolbar';
import { ParagraphToolbar } from 'notebookEditor/extension/paragraph/toolbar';

import { Toolbar } from './type';

// ********************************************************************************
// A collection of Toolbars. Each Node can have its own Toolbar. If it's not defined
// in the collection then nothing will be shown.
const TOOLBAR_MAP: Record<NodeName | MarkName, Toolbar | null> = {
  [NodeName.DOC]: DocumentToolbar,
  [NodeName.TEXT]: null/*none*/,
  [NodeName.HEADING]: HeadingToolbar,
  [NodeName.IMAGE]: ImageToolbar,
  [NodeName.PARAGRAPH]: ParagraphToolbar/*none*/,

  [MarkName.BOLD]: null/*none*/,
  [MarkName.LINK]: LinkToolbar/*none*/,
  [MarkName.STRIKETHROUGH]: null/*none*/,
  [MarkName.TEXT_STYLE]: null/*none*/,
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
