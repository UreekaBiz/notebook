import { Attributes, HeadingLevel } from '@ureeka-notebook/web-service';

import { DEFAULT_NODE_ID } from 'notebookEditor/extension/uniqueNodeId/UniqueNodeId';
import { generateNodeId } from 'notebookEditor/extension/util/node';

// ********************************************************************************
// == Type ========================================================================
// -- Options ---------------------------------------------------------------------
export interface HeadingOptions {
  levels: HeadingLevel[];
  HTMLAttributes: Attributes;
}

// ................................................................................
export const createDefaultHeadingAttributes = (level: number) =>
  ({
    id: generateNodeId()/*unique for each invocation*/,

    level,

    initialMarksSet: false/*default not set*/,
  });

// -- Defaults --------------------------------------------------------------------
export const HEADING_ID = `${DEFAULT_NODE_ID} Heading ID`;
export const DEFAULT_HEADING_LEVEL: HeadingLevel = HeadingLevel.One;
export const DEFAULT_HEADING_STYLE_SET = false;
