import { generateNodeId, Attributes, HeadingLevel } from '@ureeka-notebook/web-service';

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
  });

// -- Defaults --------------------------------------------------------------------
export const DEFAULT_HEADING_LEVEL: HeadingLevel = HeadingLevel.One;
export const DEFAULT_HEADING_STYLE_SET = false;
