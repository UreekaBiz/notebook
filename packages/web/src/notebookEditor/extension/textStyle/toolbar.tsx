import { AttributeType, MarkName } from '@ureeka-notebook/service-common';

import { InputWithUnitMarkToolItem } from 'notebookEditor/extension/shared/component/InputWithUnitToolItem';
import { SpacingToolItem } from 'notebookEditor/extension/shared/component/SpacingToolItem';
import { shouldShowToolItem } from 'notebookEditor/shared/toolItem';
import { ToolItem } from 'notebookEditor/sidebar/toolbar/type';
import { ColorPickerMarkToolItem } from '../shared/component/ColorPickerToolItem';

// ********************************************************************************
// == Tool Items ==================================================================
export const fontSizeToolItem: ToolItem = {
  toolType: 'component',
  name: 'fontSizeToolItem',

  component: (props) =>
    <InputWithUnitMarkToolItem
      {...props}
      name='Font Size'
      markName={MarkName.TEXT_STYLE}
      attributeType={AttributeType.FontSize}
      minValue={1}
    />,
};

export const textColorToolItem: ToolItem = {
  toolType: 'component',
  name: 'textColorToolItem',

  component: (props) =>
    <ColorPickerMarkToolItem
      {...props}
      name='Text Color'
      markName={MarkName.TEXT_STYLE}
      attributeType={AttributeType.Color}
    />,

  shouldShow: (editor, depth) => shouldShowToolItem(editor, depth),
};

export const highlightColorMarkToolItem: ToolItem = {
  toolType: 'component',
  name: 'highlightColorMarkToolItem',

  component: (props) =>
    <ColorPickerMarkToolItem
      {...props}
      name='Highlight Color'
      markName={MarkName.TEXT_STYLE}
      attributeType={AttributeType.BackgroundColor}
    />,

  shouldShow: (editor, depth) => shouldShowToolItem(editor, depth),
};

export const spacingToolItem: ToolItem = {
  toolType: 'component',
  name: 'spacingToolItem',

  component: SpacingToolItem,
};
