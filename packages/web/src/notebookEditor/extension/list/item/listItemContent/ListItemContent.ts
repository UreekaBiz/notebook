import { Node } from '@tiptap/core';

import { getNodeOutputSpec, ListItemContentNodeSpec, NodeName } from '@ureeka-notebook/web-service';

import { ExtensionPriority, NoOptions, NoStorage, ParseRulePriority } from 'notebookEditor/model/type';

import { listItemContentPlugin } from './plugin';
import { liftListItemContent } from './update';

// ********************************************************************************
// == Node ========================================================================
export const ListItemContent = Node.create<NoOptions, NoStorage>({
  ...ListItemContentNodeSpec,
  priority: ExtensionPriority.LIST_ITEM_CONTENT,

  // -- Keyboard Shortcut ---------------------------------------------------------
  // maintain expected Enter and Backspace behavior
  // (SEE: #liftEmptyListItemContent)
  addKeyboardShortcuts() {
    return {
      'Enter': () => liftListItemContent(this.editor, 'enter'),
      'Backspace': () => liftListItemContent(this.editor, 'backspace'),
      'Mod-Backspace': () => liftListItemContent(this.editor, 'backspace'),
    };
  },

  // -- Plugin --------------------------------------------------------------------
  addProseMirrorPlugins() { return [listItemContentPlugin()]; },

  // -- View ----------------------------------------------------------------------
  // NOTE: in order for other Blocks to be turned into ListItemContent Nodes when
  //       they are pasted, match a div tag (used by Block Nodes), and ensure
  //       that the content requires that this happens when the content is being
  //       parsed into a ListItemContent that is
  //       inside a ListItem or a TaskListItem
  parseHTML() { return [{
    tag: 'div',
    context: `${NodeName.TASK_LIST_ITEM}/${NodeName.LIST_ITEM_CONTENT}/ | ${NodeName.LIST_ITEM}/${NodeName.LIST_ITEM_CONTENT}/`,
    priority: ParseRulePriority.LIST_ITEM_CONTENT }];
  },
  renderHTML({ node, HTMLAttributes }) { return getNodeOutputSpec(node, HTMLAttributes); },
});
