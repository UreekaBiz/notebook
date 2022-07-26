import { Node } from '@tiptap/core';
import { Plugin } from 'prosemirror-state';

import { getNodeOutputSpec, isNodeSelection, isTaskListItemNode, AttributeType, NodeName, SetAttributeType, TaskListItemNodeSpec, DATA_NODE_TYPE } from '@ureeka-notebook/web-service';

import { shortcutCommandWrapper } from 'notebookEditor/command/util';
import { setAttributeParsingBehavior } from 'notebookEditor/extension/util/attribute';
import { ExtensionPriority, NoOptions, NoStorage, ParseRulePriority } from 'notebookEditor/model/type';

import { splitListItemCommand } from '../../command/splitListItemCommand';
import { liftListItemContent } from '../listItemContent/update';
import { dedentListCommand } from '../../keyboardShortcut/dedent';
import { indentListCommand } from '../../keyboardShortcut/indent';
import { listBackspaceCommand } from '../../keyboardShortcut/listBackspace';
import { getWrappingListInputRule } from '../../util';
import { TaskListItemController } from './nodeView/controller';

// ********************************************************************************
// REF: https://github.com/ueberdosis/tiptap/blob/main/packages/extension-task-item/src/task-item.ts

// == RegEx =======================================================================
// (SEE: addInputRules below)
const taskListItemRegex = /^\s*(\[([( |x])?\])\s$/;

// == Node ========================================================================
export const TaskListItem = Node.create<NoOptions, NoStorage>({
  ...TaskListItemNodeSpec,
  priority: ExtensionPriority.TASK_LIST_ITEM,

  // -- Attribute -----------------------------------------------------------------
  addAttributes() {
    return {
      [AttributeType.PaddingTop]: setAttributeParsingBehavior(AttributeType.PaddingTop, SetAttributeType.STRING),
      [AttributeType.PaddingBottom]: setAttributeParsingBehavior(AttributeType.PaddingBottom, SetAttributeType.STRING),

      // NOTE: using custom parseHTML since specific checks must be done
      [AttributeType.Checked]: {
        ...setAttributeParsingBehavior(AttributeType.Checked, SetAttributeType.BOOLEAN, false/*default*/),
        keepOnSplit: false/*split TaskListItems should not inherit the Checked attribute*/,
        renderHTML: (attributes) => ({ [AttributeType.Checked]: attributes.checked }),
      },
    };
  },

  // -- Keyboard Shortcut ---------------------------------------------------------
  addKeyboardShortcuts() {
    return {
      'Enter': () => shortcutCommandWrapper(this.editor, splitListItemCommand(NodeName.TASK_LIST_ITEM)),
      'Shift-Tab': () => {
        if(shortcutCommandWrapper(this.editor, dedentListCommand)) return true/*handled*/;
        liftListItemContent(this.editor, 'enter'/*simulate Enter*/);
        return true/*do not let Selection leave Editor*/;
      },
      'Tab': () => shortcutCommandWrapper(this.editor, indentListCommand),
      'Backspace': () => shortcutCommandWrapper(this.editor, listBackspaceCommand),
      'Mod-Backspace': () => shortcutCommandWrapper(this.editor, listBackspaceCommand),
    };
  },

  // -- Plugin --------------------------------------------------------------------
  // NOTE: this plugin's purpose is to specifically prevent the cursor from going
  //       into the start of the TaskListItem Node if the User starts checking and
  //       unchecking the TaskListItem checkbox repeatedly and quickly
  addProseMirrorPlugins() {
    return [
      new Plugin({
        filterTransaction(transaction) {
          if(isNodeSelection(transaction.selection) && isTaskListItemNode(transaction.selection.node)) {
            return false/*do not allow Task List Item Nodes to be selected*/;
          } /* else -- not selecting a TaskListItem */

          return true/*allow transaction to pass*/;
        },
      }),
    ];
  },

  // -- Input ---------------------------------------------------------------------
  // create a TaskListItem Node if the user types '[]' or '[x]' followed by a
  // space or a new line
  addInputRules() {
    return [
      getWrappingListInputRule({
        find: taskListItemRegex,
        type: this.type,
        getAttributes: (match) => ({ checked: match[match.length - 1] === 'x' }),
      }),
    ];
  },

  // -- View ----------------------------------------------------------------------
  // NOTE: this NodeView does not use React since TaskListItems do not have a
  //       complex structure, nor do they require a Storage or an Id
  addNodeView() {
    return ({ editor, node, getPos }) => {
      if(!isTaskListItemNode(node)) throw new Error(`Unexpected node type (${node.type.name}) while adding TaskListItem NodeView.`);
      return new TaskListItemController(editor, node, this.storage, getPos);
    };
  },
  parseHTML() {
    return [{
      // when parsing into TaskList, turn Blocks (that use the div tag)
      // into TaskListItems
      tag: `li, li[${DATA_NODE_TYPE}="${NodeName.TASK_LIST_ITEM}"], div`,
      priority: ParseRulePriority.TASK_LIST_ITEM,
      context: `${NodeName.TASK_LIST_ITEM}/${NodeName.LIST_ITEM_CONTENT}/`,
    },
    {
      // when parsing into the regular Document, only match TaskListItems
      tag: `li[${DATA_NODE_TYPE}="${NodeName.TASK_LIST_ITEM}"]`,
      priority: ParseRulePriority.TASK_LIST_ITEM,
    },
  ];
  },
  renderHTML({ node, HTMLAttributes }) { return getNodeOutputSpec(node, HTMLAttributes, false/*not a leaf node*/); },
});
