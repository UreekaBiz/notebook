import { BiBold } from 'react-icons/bi';

import { isHeadingNode, isParagraphNode, MarkName } from '@ureeka-notebook/web-service';

import { FontSizeToolItem } from 'notebookEditor/extension/style/component/FontSizeToolItem';
import { TextColorToolItem } from 'notebookEditor/extension/style/component/TextColorToolItem';
import { isNodeSelection } from 'notebookEditor/extension/util/node';
import { SpacingToolItem } from 'notebookEditor/extension/style/component/SpacingToolItem';

import { EditorTool } from './type';

// ********************************************************************************
// ================================================================================
export const markBold: EditorTool = {
  toolType: 'button',

  name: MarkName.BOLD,
  label: MarkName.BOLD,

  icon: <BiBold size={16} />,
  tooltip: 'Bold (⌘ + B)',

  shouldBeDisabled: (editor) => {
    const { selection } = editor.state;
    if(isNodeSelection(selection)) return true;
    if(isParagraphNode(selection.$anchor.parent) || isHeadingNode(selection.$anchor.parent)) return false;
    /* else -- selection somewhere that does not allow bold */

    return true;
  },
  shouldShow: (editor, depth) => depth === undefined || editor.state.selection.$anchor.depth === depth/*direct parent*/,
  onClick: (editor) => editor.chain().focus().toggleBold().run(),
};

// == Text Style ==================================================================
export const fontSizeToolItem: EditorTool = {
  toolType: 'component',
  name: 'fontSizeToolItem',

  component: (props) => <FontSizeToolItem {...props} />,
};

export const textColorToolItem: EditorTool = {
  toolType: 'component',
  name: 'textColorToolItem',

  component: (props) => <TextColorToolItem {...props} />,
};

export const spacingToolItem: EditorTool = {
  toolType: 'component',
  name: 'spacingToolItem',

  component: (props) => <SpacingToolItem {...props} />,
};
