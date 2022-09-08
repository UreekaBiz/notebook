import { Node } from '@tiptap/core';
import { Plugin } from 'prosemirror-state';

import { getNodeOutputSpec, isNodeSelection, isTaskListItemNode, AttributeType, NodeName, TaskListItemNodeSpec, NotebookSchemaType, DATA_NODE_TYPE, DATA_TASK_LIST_ITEM_CHECKED } from '@ureeka-notebook/web-service';

import { shortcutCommandWrapper } from 'notebookEditor/command/util';
import { NoOptions, NoStorage, ParseRulePriority } from 'notebookEditor/model/type';

import { splitListItemCommand } from '../command/splitListItemCommand';
import { dedentListCommand } from '../keyboardShortcut/dedent';
import { indentListCommand } from '../keyboardShortcut/indent';
import { listBackspaceCommand } from '../keyboardShortcut/listBackspace';
import { getWrappingListInputRule } from '../util';
import { TaskListItemController } from './nodeView/controller';

// ********************************************************************************
// REF: https://github.com/ueberdosis/tiptap/blob/main/packages/extension-task-item/src/task-item.ts

// == RegEx =======================================================================
// (SEE: addInputRules below)
const taskListItemRegex = /^\s*(\[([( |x])?\])\s$/;

// == Node ========================================================================
export const TaskListItem = Node.create<NoOptions, NoStorage>({
  ...TaskListItemNodeSpec,

  // -- Attribute -----------------------------------------------------------------
  addAttributes() {
    return {
      // CHECK: is it correct for this to be inline? This is not a blocker but
      //        some time needs to be spent thinking on how to parse custom attributes
      [AttributeType.Checked]: {
        default: false/*not checked*/,
        keepOnSplit: false/*new TaskListItems should not get the checked attribute*/,
        parseHTML: (element) => element.getAttribute(DATA_TASK_LIST_ITEM_CHECKED) === 'true',
        renderHTML: (attributes) => ({ DATA_TASK_LIST_ITEM_CHECKED: attributes.checked }),
      },
    };
  },

  // -- Keyboard Shortcut ---------------------------------------------------------
  addKeyboardShortcuts() {
    return {
      Enter: () => shortcutCommandWrapper(this.editor, splitListItemCommand(NodeName.TASK_LIST_ITEM)),
      Tab: () => shortcutCommandWrapper(this.editor, indentListCommand),
      'Shift-Tab': () => shortcutCommandWrapper(this.editor, dedentListCommand),
      Backspace: () => shortcutCommandWrapper(this.editor, listBackspaceCommand),
      'Mod-Backspace': () => shortcutCommandWrapper(this.editor, listBackspaceCommand),
    };
  },

  // -- Plugin --------------------------------------------------------------------
  // NOTE: this plugin's purpose is to specifically prevent the cursor from going
  //       into the start of the TaskListItem Node if the User starts checking and
  //       unchecking the TaskListItem checkbox repeatedly and quickly
  addProseMirrorPlugins(this) {
    return [
      new Plugin<NotebookSchemaType>({
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
  parseHTML() { return [ { tag: `li[${DATA_NODE_TYPE}="${NodeName.TASK_LIST_ITEM}"]`, priority: ParseRulePriority.TASK_LIST } ]; },
  renderHTML({ node, HTMLAttributes }) { return getNodeOutputSpec(node, HTMLAttributes, false/*not a leaf node*/); },
});
