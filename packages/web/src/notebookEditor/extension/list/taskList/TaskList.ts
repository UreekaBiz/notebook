import { Node } from '@tiptap/core';

import { getNodeOutputSpec, NodeName, TaskListNodeSpec, DATA_NODE_TYPE } from '@ureeka-notebook/web-service';

import { NoOptions, NoStorage, ParseRulePriority } from 'notebookEditor/model/type';

import { handleListDocumentUpdates } from '../util';

// ********************************************************************************
// REF: https://github.com/ueberdosis/tiptap/blob/main/packages/extension-task-list/src/task-list.ts

// == Node ========================================================================
export const TaskList = Node.create<NoOptions, NoStorage>({
  ...TaskListNodeSpec,

  // -- Command -------------------------------------------------------------------
  addKeyboardShortcuts() {
    return {
      'Mod-Shift-9': () => handleListDocumentUpdates(this.editor, NodeName.TASK_LIST),
      'Ctrl-Shift-9': () => handleListDocumentUpdates(this.editor, NodeName.TASK_LIST),
    };
  },

  // -- View ----------------------------------------------------------------------
  parseHTML() { return [ { tag: `ul[${DATA_NODE_TYPE}="${NodeName.TASK_LIST}"]`, priority: ParseRulePriority.TASK_LIST } ]; },
  renderHTML({ node, HTMLAttributes }) { return getNodeOutputSpec(node, HTMLAttributes, false/*not a leaf node*/); },
});
