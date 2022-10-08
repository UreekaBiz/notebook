import { MdHorizontalRule } from 'react-icons/md';

import { NodeName } from '@ureeka-notebook/web-service';

import { Toolbar, ToolItem } from 'notebookEditor/sidebar/toolbar/type';
import { toolItemCommandWrapper } from 'notebookEditor/command/util';

import { insertOrToggleHorizontalRuleCommand } from '../command';
import { HorizontalRuleHeightToolItem } from './HorizontalRuleHeightToolItem';
import { HorizontalRuleColorToolItem } from './HorizontalRuleColorToolItem';

// ********************************************************************************
// == Tool Items ==================================================================
export const horizontalRuleToolItem: ToolItem = {
  toolType: 'button',
  name: NodeName.HORIZONTAL_RULE,
  label: NodeName.HORIZONTAL_RULE,

  icon: <MdHorizontalRule size={16} />,
  tooltip: 'Horizontal Rule',

  shouldBeDisabled: (editor) => editor.isActive(NodeName.HORIZONTAL_RULE),
  shouldShow: (editor, depth) => depth === undefined || editor.state.selection.$anchor.depth === depth/*direct parent*/,
  isActive: (editor) => editor.isActive(NodeName.HORIZONTAL_RULE),
  onClick: (editor, depth) => toolItemCommandWrapper(editor, depth, insertOrToggleHorizontalRuleCommand),
};

const horizontalRuleHeightToolItem: ToolItem =  {
  toolType: 'component',
  name: 'horizontalRuleHeightToolItem',

  component: HorizontalRuleHeightToolItem,
};

const horizontalRuleColorToolItem: ToolItem =  {
  toolType: 'component',
  name: 'horizontalRuleColorToolItem',

  component: HorizontalRuleColorToolItem,
};


// == Toolbar =====================================================================
export const HorizontalRuleToolbar: Toolbar = {
  title: 'Horizontal Rule',
  name: NodeName.HORIZONTAL_RULE/*Expected and guaranteed to be unique*/,

  toolsCollections: [
    [
      horizontalRuleColorToolItem,
      horizontalRuleHeightToolItem,
    ],
  ],
};
