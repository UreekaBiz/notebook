import { Node } from '@tiptap/core';

import { getNodeOutputSpec, ListItemNodeSpec, NodeName, AttributeType, SetAttributeType, ListStyle, DATA_LIST_ITEM_SEPARATOR, DATA_LIST_ITEM_LIST_STYLE, DATA_NODE_TYPE, LIST_ITEM_DEFAULT_SEPARATOR } from '@ureeka-notebook/web-service';

import { shortcutCommandWrapper } from 'notebookEditor/command/util';
import { setAttributeParsingBehavior } from 'notebookEditor/extension/util/attribute';
import { ExtensionPriority, NoOptions, NoStorage, ParseRulePriority } from 'notebookEditor/model/type';

import { splitListItemCommand } from '../../command/splitListItemCommand';
import { liftListItemContent } from '../listItemContent/update';
import { indentListCommand } from '../../keyboardShortcut/indent';
import { dedentListCommand } from '../../keyboardShortcut/dedent';
import { listBackspaceCommand } from '../../keyboardShortcut/listBackspace';
import { listItemTaskListItemPlugin } from './plugin';

// ********************************************************************************
// REF: https://github.com/ueberdosis/tiptap/blob/main/packages/extension-list-item/src/list-item.ts

// == Node ========================================================================
export const ListItem = Node.create<NoOptions, NoStorage>({
  ...ListItemNodeSpec,
  priority: ExtensionPriority.LIST_ITEM,

  // -- Attribute -----------------------------------------------------------------
  addAttributes() {
    return {
      // NOTE: these attributes have influence on all ListItems
      [AttributeType.PaddingTop]: setAttributeParsingBehavior(AttributeType.PaddingTop, SetAttributeType.STRING),
      [AttributeType.PaddingBottom]: setAttributeParsingBehavior(AttributeType.PaddingBottom, SetAttributeType.STRING),

      // NOTE: these attributes only have influence on ListItems inside OrderedLists
      [AttributeType.ListStyleType]: setAttributeParsingBehavior(DATA_LIST_ITEM_LIST_STYLE, SetAttributeType.STRING, ListStyle.DECIMAL),
      [AttributeType.Separator]: setAttributeParsingBehavior(DATA_LIST_ITEM_SEPARATOR, SetAttributeType.STRING, LIST_ITEM_DEFAULT_SEPARATOR),
    };
  },

  // -- Plugin  ------------------------------------------------------------------
  addProseMirrorPlugins() { return [listItemTaskListItemPlugin()]; },

  // -- Keyboard Shortcut ---------------------------------------------------------
  addKeyboardShortcuts() {
    return {
      'Enter': () => shortcutCommandWrapper(this.editor, splitListItemCommand(NodeName.LIST_ITEM)),
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

  // -- View ----------------------------------------------------------------------
  parseHTML() {
    return [{
      // match ListItem tags and Block Nodes (which use the div tag)
      tag: `li, li[${DATA_NODE_TYPE}="${NodeName.LIST_ITEM}"], div`,
      priority: ParseRulePriority.LIST_ITEM,

      // only match when applying parse rule into a
      // ListItemContent inside a ListItem Node
      context: `${NodeName.LIST_ITEM}/${NodeName.LIST_ITEM_CONTENT}/`,
    }];
  },
  renderHTML({ node, HTMLAttributes }) { return getNodeOutputSpec(node, HTMLAttributes, false/*not a leaf node*/); },
});
