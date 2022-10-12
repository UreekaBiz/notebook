import { Editor } from '@tiptap/core';
import { BiAlignLeft, BiAlignJustify, BiAlignMiddle, BiAlignRight } from 'react-icons/bi';
import { MdFormatIndentDecrease, MdFormatIndentIncrease } from 'react-icons/md';

import { getParentNode, isNodeSelection, isListItemContentNode, textAlignToJustifyContent, SelectionDepth, TextAlign, isTaskListItemNode, AttributeType } from '@ureeka-notebook/web-service';

import { toolItemCommandWrapper } from 'notebookEditor/command/util';
import { shouldShowToolItemInsideList } from 'notebookEditor/extension/list/util';
import { ToolItem } from 'notebookEditor/sidebar/toolbar/type';

import { changeBlockIndentationCommand, changeHorizontalAlignmentCommand } from './command';

// ********************************************************************************
// -- Indentation -----------------------------------------------------------------
export const dedentBlocksToolItem: ToolItem = {
  toolType: 'button',

  name: 'dedentBlocksToolItem',
  label: 'dedentBlocksToolItem',

  icon: <MdFormatIndentDecrease size={16} />,
  tooltip: 'Decrease Indent (⌘ + [)',

  shouldBeDisabled: (editor) => isNodeSelection(editor.state.selection),
  onClick: (editor, depth) => toolItemCommandWrapper(editor, depth, changeBlockIndentationCommand('dedent')),
};

export const indentBlocksToolItem: ToolItem = {
  toolType: 'button',

  name: 'indentBlocksToolItem',
  label: 'indentBlocksToolItem',

  icon: <MdFormatIndentIncrease size={16} />,
  tooltip: 'Increase Indent (⌘ + ])',

  shouldBeDisabled: (editor) => isNodeSelection(editor.state.selection),
  onClick: (editor, depth) => toolItemCommandWrapper(editor, depth, changeBlockIndentationCommand('indent')),
};

// -- Alignment -------------------------------------------------------------------
export const horizontalAlignLeftToolItem: ToolItem = {
  toolType: 'button',

  name: 'horizontalAlignLeftToolItem',
  label: 'horizontalAlignLeftToolItem',

  icon: <BiAlignLeft size={16} />,
  tooltip: 'Left Align',

  shouldBeDisabled: (editor) => isNodeSelection(editor.state.selection),
  shouldShow: (editor, depth) => shouldShowToolItem(editor, depth),
  isActive: (editor) => isHorizontalAlignToolItemActive(editor, TextAlign.left),
  onClick: (editor, depth) => toolItemCommandWrapper(editor, depth, changeHorizontalAlignmentCommand(TextAlign.left)),
};
export const horizontalAlignCenterToolItem: ToolItem = {
  toolType: 'button',

  name: 'horizontalAlignCenterToolItem',
  label: 'horizontalAlignCenterToolItem',

  icon: <BiAlignMiddle size={16} />,
  tooltip: 'Center Align',

  shouldBeDisabled: (editor) => isNodeSelection(editor.state.selection),
  shouldShow: (editor, depth) => shouldShowToolItem(editor, depth),
  isActive: (editor) => isHorizontalAlignToolItemActive(editor, TextAlign.center),
  onClick: (editor, depth) => toolItemCommandWrapper(editor, depth, changeHorizontalAlignmentCommand(TextAlign.center)),
};
export const horizontalAlignRightToolItem: ToolItem = {
  toolType: 'button',

  name: 'horizontalAlignRightToolItem',
  label: 'horizontalAlignRightToolItem',

  icon: <BiAlignRight size={16} />,
  tooltip: 'Right Align',

  shouldBeDisabled: (editor) => isNodeSelection(editor.state.selection),
  shouldShow: (editor, depth) => shouldShowToolItem(editor, depth),
  isActive: (editor) => isHorizontalAlignToolItemActive(editor, TextAlign.right),
  onClick: (editor, depth) => toolItemCommandWrapper(editor, depth, changeHorizontalAlignmentCommand(TextAlign.right)),
};
export const horizontalAlignJustifyToolItem: ToolItem = {
  toolType: 'button',

  name: 'horizontalAlignJustifyToolItem',
  label: 'horizontalAlignJustifyToolItem',

  icon: <BiAlignJustify size={16} />,
  tooltip: 'Justify',

  shouldBeDisabled: (editor) => isNodeSelection(editor.state.selection),
  shouldShow: (editor, depth) => shouldShowToolItem(editor, depth),
  isActive: (editor) => isHorizontalAlignToolItemActive(editor, TextAlign.justify),
  onClick: (editor, depth) => toolItemCommandWrapper(editor, depth, changeHorizontalAlignmentCommand(TextAlign.justify)),
};
const isHorizontalAlignToolItemActive = (editor: Editor, alignment: TextAlign) => {
  const { $anchor, empty } = editor.state.selection;
  if(!empty) return false/*cannot determine whether the ToolItem is active when Selection spans multiple Nodes*/;

  const { parent: anchorParent } = $anchor;
  if(isListItemContentNode(anchorParent)) {
    const parentListItem = $anchor.node(-1/*parent*/);

    if(isTaskListItemNode(parentListItem)) {
      const justifyContent = parentListItem.attrs[AttributeType.JustifyContent];
      if(!justifyContent) return false/*not set*/;
      return justifyContent === textAlignToJustifyContent(alignment);
    } /* else -- ListItem by contract */

    if(!(parentListItem.attrs[AttributeType.TextAlign])) return false/*not set*/;
    return parentListItem.attrs[AttributeType.TextAlign] === alignment;
  } /* else -- regular Block */

  if(!($anchor.parent.attrs[AttributeType.TextAlign])) return false/*not set*/;
  return $anchor.parent.attrs[AttributeType.TextAlign] === alignment;
};

// -- Util ------------------------------------------------------------------------
// return whether or not a ToolItem should be shown based on whether or not it is
// currently being shown on a Selection inside a List
export const shouldShowToolItem = (editor: Editor, depth: SelectionDepth) => {
  if(isListItemContentNode(getParentNode(editor.state.selection))) {
    return shouldShowToolItemInsideList(editor.state, depth);
  } /* else -- not inside ListItemContent */

  return depth === undefined || editor.state.selection.$anchor.depth === depth;/*direct parent*/
};
