import { NodeName } from '@ureeka-notebook/web-service';

import { DocumentToolbar } from 'notebookEditor/extension/document/toolbar';
import { HeadingToolbar } from 'notebookEditor/extension/heading/toolbar';
import { ImageToolbar } from 'notebookEditor/extension/image/toolbar';
import { ParagraphToolbar } from 'notebookEditor/extension/paragraph/toolbar';

import { Toolbar } from './type';

// ********************************************************************************
// A collection of Toolbars. Each Node can have its own Toolbar. If it's not defined
// in the collection then nothing will be shown.
const TOOLBAR_MAP: Record<NodeName, Toolbar | null> = {
  [NodeName.DOC]: DocumentToolbar,
  [NodeName.TEXT]: null/*none*/,
  [NodeName.HEADING]: HeadingToolbar,
  [NodeName.IMAGE]: ImageToolbar,
  [NodeName.PARAGRAPH]: ParagraphToolbar/*none*/,
};

// --------------------------------------------------------------------------------
/**
 * @param nodeName The name of the node whose toolbar is being asked for
 * @returns The corresponding Toolbar for the given Node name
 */
export const getToolbar = (nodeName: NodeName): Toolbar | null => {
  let toolbar = TOOLBAR_MAP[nodeName];
  return toolbar;
};
