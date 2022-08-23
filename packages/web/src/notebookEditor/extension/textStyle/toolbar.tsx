import { AttributeType, MarkName } from '@ureeka-notebook/service-common';

import { InputWithUnitMarkToolItem } from 'notebookEditor/extension/shared/component/InputWithUnitToolItem';
import { ColorPickerMarkToolItem } from 'notebookEditor/extension/shared/component/ColorPickerToolItem';
import { SpacingToolItem } from 'notebookEditor/extension/shared/component/SpacingToolItem';
import { ToolItem } from 'notebookEditor/toolbar/type';

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
      attributeType={AttributeType.TextColor}
    />,
};

export const spacingToolItem: ToolItem = {
  toolType: 'component',
  name: 'spacingToolItem',

  component: SpacingToolItem,
};
