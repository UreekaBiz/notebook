import { Node } from '@tiptap/core';

import { getNodeOutputSpec, AttributeType, ListItemContentNodeSpec, NodeName, SetAttributeType, DATA_NODE_TYPE } from '@ureeka-notebook/web-service';

import { setAttributeParsingBehavior } from 'notebookEditor/extension/util/attribute';
import { ExtensionPriority, NoOptions, NoStorage } from 'notebookEditor/model/type';

import { listItemContentPlugin } from './plugin';
import { liftListItemContent } from './update';

// ********************************************************************************
// == Node ========================================================================
export const ListItemContent = Node.create<NoOptions, NoStorage>({
  ...ListItemContentNodeSpec,
  priority: ExtensionPriority.LIST_ITEM_CONTENT,

  // -- Attribute -----------------------------------------------------------------
  addAttributes() {
    return {
      [AttributeType.BackgroundColor]: setAttributeParsingBehavior(AttributeType.BackgroundColor, SetAttributeType.STYLE),
      [AttributeType.Color]: setAttributeParsingBehavior(AttributeType.Color, SetAttributeType.STYLE),
      [AttributeType.FontSize]: setAttributeParsingBehavior(AttributeType.FontSize, SetAttributeType.STYLE),
    };
  },

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
  parseHTML() { return [{ tag: `div[${DATA_NODE_TYPE}="${NodeName.LIST_ITEM_CONTENT}"]` }]; },
  renderHTML({ node, HTMLAttributes }) { return getNodeOutputSpec(node, HTMLAttributes); },
});
