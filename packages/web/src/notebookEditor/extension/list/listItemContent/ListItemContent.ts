import { Node } from '@tiptap/core';

import { getNodeOutputSpec, ListItemContentNodeSpec, NodeName, DATA_NODE_TYPE } from '@ureeka-notebook/web-service';

import { ExtensionPriority, NoOptions, NoStorage } from 'notebookEditor/model/type';

import { listItemContentPlugin } from './plugin';
import { liftListItemContent } from './update';

// ********************************************************************************
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
    };
  },

  // -- Plugin --------------------------------------------------------------------
  addProseMirrorPlugins() { return [listItemContentPlugin()]; },

  // -- View ----------------------------------------------------------------------
  parseHTML() { return [{ tag: `div[${DATA_NODE_TYPE}="${NodeName.LIST_ITEM_CONTENT}"]` }]; },
  renderHTML({ node, HTMLAttributes }) { return getNodeOutputSpec(node, HTMLAttributes); },
});
