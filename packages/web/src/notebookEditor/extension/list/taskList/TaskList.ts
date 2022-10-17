import { Node } from '@tiptap/core';

import { getNodeOutputSpec, NodeName, SetAttributeType, TaskListNodeSpec, AttributeType, DATA_NODE_TYPE } from '@ureeka-notebook/web-service';

import { setAttributeParsingBehavior } from 'notebookEditor/extension/util/attribute';
import { NoOptions, NoStorage, ParseRulePriority } from 'notebookEditor/model/type';

import { handleListDocumentUpdates } from '../util';

// ********************************************************************************
// REF: https://github.com/ueberdosis/tiptap/blob/main/packages/extension-task-list/src/task-list.ts

// == Node ========================================================================
export const TaskList = Node.create<NoOptions, NoStorage>({
  ...TaskListNodeSpec,

  // -- Attribute -----------------------------------------------------------------
  addAttributes() { return { [AttributeType.MarginLeft]: setAttributeParsingBehavior(AttributeType.MarginLeft, SetAttributeType.STYLE) }; },

  // -- Command -------------------------------------------------------------------
  addKeyboardShortcuts() {
    return {
      'Mod-Shift-9': () => handleListDocumentUpdates(this.editor, NodeName.TASK_LIST),
      'Ctrl-Shift-9': () => handleListDocumentUpdates(this.editor, NodeName.TASK_LIST),
    };
  },

  // -- View ----------------------------------------------------------------------
  // NOTE: only parsing as TaskList ULs to give preference to regular ULs, yet
  //       applying specific priority to ensure right behavior
  parseHTML() { return [ { tag: `ul[${DATA_NODE_TYPE}="${NodeName.TASK_LIST}"]`, priority: ParseRulePriority.TASK_LIST } ]; },
  renderHTML({ node, HTMLAttributes }) { return getNodeOutputSpec(node, HTMLAttributes, false/*not a leaf node*/); },
});
