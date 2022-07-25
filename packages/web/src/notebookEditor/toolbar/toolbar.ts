import { NodeName } from '@ureeka-notebook/web-service';

import { DocumentToolbar } from 'notebookEditor/extension/document/toolbar';
import { HeadingToolbar } from 'notebookEditor/extension/heading/toolbar';
import { ParagraphToolbar } from 'notebookEditor/extension/paragraph/toolbar';

import { EditorToolbar } from './type';

// ********************************************************************************
const TOOLBAR_MAP: Record<NodeName, EditorToolbar | null> = {
  [NodeName.DOC]: DocumentToolbar,
  [NodeName.TEXT]: null/*none*/,
  [NodeName.PARAGRAPH]: ParagraphToolbar,
  [NodeName.HEADING]: HeadingToolbar,
};

/**
 * Gets the corresponding toolbar for a given node
 * @param nodeName The name of the node whose toolbar is being asked for
 * @returns The corresponding toolbar object for the given node name
 */
export const getToolbar = (nodeName: NodeName): EditorToolbar | null => {
  let toolbar = TOOLBAR_MAP[nodeName];
  return toolbar;
};
