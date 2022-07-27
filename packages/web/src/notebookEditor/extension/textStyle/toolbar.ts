import { FontSizeToolItem } from 'notebookEditor/extension/style/component/FontSizeToolItem';
import { TextColorToolItem } from 'notebookEditor/extension/style/component/TextColorToolItem';
import { SpacingToolItem } from 'notebookEditor/extension/style/component/SpacingToolItem';
import { ToolItem } from 'notebookEditor/toolbar/type';

// ********************************************************************************
// == Tool Items ==================================================================
export const fontSizeToolItem: ToolItem = {
  toolType: 'component',
  name: 'fontSizeToolItem',

  component: FontSizeToolItem,
};

export const textColorToolItem: ToolItem = {
  toolType: 'component',
  name: 'textColorToolItem',

  component: TextColorToolItem,
};

export const spacingToolItem: ToolItem = {
  toolType: 'component',
  name: 'spacingToolItem',

  component: SpacingToolItem,
};
