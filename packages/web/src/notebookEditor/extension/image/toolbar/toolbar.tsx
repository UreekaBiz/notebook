import { AiOutlineVerticalAlignBottom, AiOutlineVerticalAlignMiddle, AiOutlineVerticalAlignTop } from 'react-icons/ai';
import { FiImage } from 'react-icons/fi';

import { AttributeType, NodeName, VerticalAlign, DEFAULT_IMAGE_MAX_HEIGHT, DEFAULT_IMAGE_MIN_HEIGHT, DEFAULT_IMAGE_MAX_WIDTH, DEFAULT_IMAGE_MIN_WIDTH } from '@ureeka-notebook/web-service';

import { getTextDOMRenderedValue } from 'notebookEditor/extension/util/attribute';
import { getDialogStorage } from 'notebookEditor/model/DialogStorage';
import { setVerticalAlign } from 'notebookEditor/shared/command';
import { InputWithUnitNodeToolItem } from 'notebookEditor/extension/shared/component/InputWithUnitToolItem';
import { InputToolItem } from 'notebookEditor/extension/shared/component/InputToolItem';
import { Toolbar, ToolItem } from 'notebookEditor/sidebar/toolbar/type';

import { ImageSrcToolItem } from './ImageSrcToolItem';
import { ImageBorderToolItem } from './ImageBorderToolItem';

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
    editor.view.focus()/*trigger editor update by focusing it*/;
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
      minValue={DEFAULT_IMAGE_MIN_WIDTH}
      maxValue={DEFAULT_IMAGE_MAX_WIDTH}
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
      minValue={DEFAULT_IMAGE_MIN_HEIGHT}
      maxValue={DEFAULT_IMAGE_MAX_HEIGHT}
    />,
};

// -- Border ----------------------------------------------------------------------
const imageBorderToolItem: ToolItem = {
  toolType: 'component',
  name: 'imageBorderToolItem',

  component: ImageBorderToolItem,
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
      imageBorderToolItem,
    ],
    [
      verticalAlignTopToolItem,
      verticalAlignMiddleToolItem,
      verticalAlignBottomToolItem,
    ],
  ],
};
