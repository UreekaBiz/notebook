import { AttributeType, NodeName } from '@ureeka-notebook/web-service';

// ********************************************************************************
// == Theme =======================================================================
export const theme: Record<NodeName, Partial<Record<AttributeType, string>>> = {
  // ProseMirror Nodes
  [NodeName.DOC]: {},
  [NodeName.HEADING]: {},
  [NodeName.PARAGRAPH]: {
    [AttributeType.FontSize]: '16px',
    [AttributeType.TextColor]: '#333',
    [AttributeType.MarginLeft]: '4px',
  },
  [NodeName.TEXT]: {},

  // Custom Nodes
  // Currently nothing
} as const;

// == CSS =========================================================================
// -- General ---------------------------------------------------------------------
// NOTE: Must match CSS variables. (SEE: index.css)
export const LIGHT_GRAY = '#E2E8F0';
export const FOCUS_COLOR = '#5E9ED6';

// -- Button ----------------------------------------------------------------------
export const ACTIVE_BUTTON_COLOR = '#E2E8F0';

// -- Node ------------------------------------------------------------------------
export const INLINE_NODE_CONTAINER_CLASS = 'inlineNodeContainer';
export const SELECTED_CLASS = 'selected';
export const SELECTED_TEXT_CLASS = 'selected_text';

// -- Chip ------------------------------------------------------------------------
export const CHIP_CLASS = 'chip';
export const CHIP_CLOSE_BUTTON_CLASS = 'chipCloseButton';
