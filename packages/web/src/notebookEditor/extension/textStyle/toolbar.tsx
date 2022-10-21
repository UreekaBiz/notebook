import { AttributeType, MarkName } from '@ureeka-notebook/service-common';

import { InputWithUnitMarkToolItem } from 'notebookEditor/extension/shared/component/InputWithUnitToolItem';
import { SpacingToolItem } from 'notebookEditor/extension/shared/component/SpacingToolItem';
import { shouldShowToolItem } from 'notebookEditor/shared/toolItem';
import { ToolItem } from 'notebookEditor/sidebar/toolbar/type';
import { GoogleDocsColorPickerMarkToolItem } from '../shared/component/GoogleDocsColorPickerToolItem';

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
    <GoogleDocsColorPickerMarkToolItem
      {...props}
      name='Text Color'
      markName={MarkName.TEXT_STYLE}
      attributeType={AttributeType.Color}
    />,

  shouldShow: (editor, depth) => shouldShowToolItem(editor, depth),
};

export const backgroundColorToolItem: ToolItem = {
  toolType: 'component',
  name: 'backgroundColorToolItem',

  component: (props) =>
    <GoogleDocsColorPickerMarkToolItem
      {...props}
      name='Background Color'
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
