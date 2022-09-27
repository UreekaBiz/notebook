import { AiOutlineVerticalAlignBottom, AiOutlineVerticalAlignMiddle, AiOutlineVerticalAlignTop } from 'react-icons/ai';
import { FiImage } from 'react-icons/fi';

import { AttributeType, NodeName, VerticalAlign, MAX_IMAGE_HEIGHT, MAX_IMAGE_WIDTH, MIN_IMAGE_HEIGHT, MIN_IMAGE_WIDTH } from '@ureeka-notebook/web-service';

import { getTextDOMRenderedValue } from 'notebookEditor/extension/util/attribute';
import { getDialogStorage } from 'notebookEditor/model/DialogStorage';
import { InputWithUnitNodeToolItem } from 'notebookEditor/extension/shared/component/InputWithUnitToolItem';
import { InputToolItem } from 'notebookEditor/extension/shared/component/InputToolItem';
import { Toolbar, ToolItem } from 'notebookEditor/sidebar/toolbar/type';

import { setVerticalAlign } from '../command';
import { ImageSrcToolItem } from './ImageSrcToolItem';

//*********************************************************************************
// == Tool Items ==================================================================
// -- Image -----------------------------------------------------------------------
export const imageToolItem: ToolItem = {
  toolType: 'button',

  name: NodeName.IMAGE,
  label: NodeName.IMAGE,

  icon: <FiImage size={16} />,
  tooltip: 'Add an Image (⌘ + ⌥ + I)',

  shouldBeDisabled: (editor) => editor.isActive(NodeName.IMAGE),
  onClick: (editor) => {
    const imageStorage = getDialogStorage(editor, NodeName.IMAGE);
    if(!imageStorage) return/*nothing to do*/;

    imageStorage.setShouldInsertNodeOrMark(true);
    editor.commands.focus()/*trigger editor update by focusing it*/;
  },
};

const imageSrcToolItem: ToolItem =  {
  toolType: 'component',
  name: 'imageSrcToolItem',

  component: ImageSrcToolItem,
};

const imageAltToolItem: ToolItem =  {
  toolType: 'component',
  name: 'imageAltToolItem',

  component: (props) =>
    <InputToolItem
      {...props}
      name='Alt'
      nodeName={NodeName.IMAGE}
      attributeType={AttributeType.Alt}
    />,
};

const imageTitleToolItem: ToolItem =  {
  toolType: 'component',
  name: 'imageTitleToolItem',

  component: (props) =>
    <InputToolItem
      {...props}
      name='Title'
      nodeName={NodeName.IMAGE}
      attributeType={AttributeType.Title}
    />,
};

const imageWidthToolItem: ToolItem =  {
  toolType: 'component',
  name: 'imageWidthToolItem',

  component: (props) =>
    <InputWithUnitNodeToolItem
      {...props}
      name='Width'
      nodeName={NodeName.IMAGE}
      attributeType={AttributeType.Width}
      minValue={MIN_IMAGE_WIDTH}
      maxValue={MAX_IMAGE_WIDTH}
    />,
};

const imageHeightToolItem: ToolItem =  {
  toolType: 'component',
  name: 'imageHeightToolItem',

  component: (props) =>
    <InputWithUnitNodeToolItem
      {...props}
      name='Height'
      nodeName={NodeName.IMAGE}
      attributeType={AttributeType.Height}
      minValue={MIN_IMAGE_HEIGHT}
      maxValue={MAX_IMAGE_HEIGHT}
    />,
};

// -- Alignment -------------------------------------------------------------------
// NOTE: VerticalAlign toolItems are currently used only in this branch
const verticalAlignTopToolItem: ToolItem = {
  toolType: 'button',
  name: `verticalAlign-${VerticalAlign.top}`,
  tooltip: 'Vertical Align - Top',
  icon: <AiOutlineVerticalAlignTop size={16} />,
  label: `verticalAlign-${VerticalAlign.top}`,

  onClick: (editor) => setVerticalAlign(editor, VerticalAlign.top),

  // Check if the attribute value corresponds to this tool item. This value is
  // calculated based on the DOM rendered value.
  isActive: (editor) => {
    const domRenderValue = getTextDOMRenderedValue(editor, AttributeType.VerticalAlign);
    return domRenderValue === VerticalAlign.top;
  },
};

const verticalAlignMiddleToolItem: ToolItem = {
  toolType: 'button',
  name: `verticalAlign-${VerticalAlign.middle}`,
  tooltip: 'Vertical Align - Middle',
  icon: <AiOutlineVerticalAlignMiddle size={16} />,
  label: `verticalAlign-${VerticalAlign.middle}`,

  onClick: (editor) => setVerticalAlign(editor, VerticalAlign.middle),

  // Check if the attribute value corresponds to this tool item. This value is
  // calculated based on the DOM rendered value.
  isActive: (editor) => {
    const domRenderValue = getTextDOMRenderedValue(editor, AttributeType.VerticalAlign);
    return domRenderValue === VerticalAlign.middle;
  },
};

const verticalAlignBottomToolItem: ToolItem = {
  toolType: 'button',
  name: `verticalAlign-${VerticalAlign.bottom}`,
  tooltip: 'Vertical Align - Bottom',
  icon: <AiOutlineVerticalAlignBottom size={16} />,
  label: `verticalAlign-${VerticalAlign.bottom}`,

  onClick: (editor) => setVerticalAlign(editor, VerticalAlign.bottom),

  // Check if the attribute value corresponds to this tool item. This value is
  // calculated based on the DOM rendered value.
  isActive: (editor) => {
    const domRenderValue = getTextDOMRenderedValue(editor, AttributeType.VerticalAlign);
    return domRenderValue === VerticalAlign.bottom;
  },
};

// == Toolbar =====================================================================
export const ImageToolbar: Toolbar = {
  title: NodeName.IMAGE,
  name: NodeName.IMAGE,

  toolsCollections: [
    [
      imageSrcToolItem,
      imageAltToolItem,
      imageTitleToolItem,
      imageWidthToolItem,
      imageHeightToolItem,
    ],
    [
      verticalAlignTopToolItem,
      verticalAlignMiddleToolItem,
      verticalAlignBottomToolItem,
    ],
  ],
};
