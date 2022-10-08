import { nodeInputRule, Node } from '@tiptap/core';

import { getNodeOutputSpec, AttributeType, HorizontalRuleNodeSpec, NodeName, SetAttributeType, DATA_NODE_TYPE } from '@ureeka-notebook/web-service';
import { shortcutCommandWrapper } from 'notebookEditor/command/util';

import { NoOptions, NoStorage } from 'notebookEditor/model/type';

import { setAttributeParsingBehavior } from '../util/attribute';
import { blockArrowDownCommand, blockArrowUpCommand } from '../util/node';
import { insertOrToggleHorizontalRuleCommand } from './command';

// ********************************************************************************
// REF: https://github.com/ueberdosis/tiptap/blob/main/packages/extension-horizontal-rule/src/horizontal-rule.ts

// == RegEx =======================================================================
const horizontalRuleRegEx = /^(?:---|—-|___\s|\*\*\*\s)$/;

// == Node ========================================================================
export const HorizontalRule = Node.create<NoOptions, NoStorage>({
  ...HorizontalRuleNodeSpec,

  // -- Attribute -----------------------------------------------------------------
  addAttributes() {
    return {
      [AttributeType.BackgroundColor]: setAttributeParsingBehavior(AttributeType.Color, SetAttributeType.STRING),
      [AttributeType.Height]: setAttributeParsingBehavior(AttributeType.Height, SetAttributeType.STRING),
    };
  },

  // -- Keyboard Shortcut ---------------------------------------------------------
  addKeyboardShortcuts() {
    return {
      // toggle a HorizontalRule
      'Mod-h': () => insertOrToggleHorizontalRuleCommand(this.editor.state, this.editor.view.dispatch),
      'Mod-H': () => insertOrToggleHorizontalRuleCommand(this.editor.state, this.editor.view.dispatch),

      // set GapCursor if necessary
      'ArrowUp': () => shortcutCommandWrapper(this.editor, blockArrowUpCommand(NodeName.HORIZONTAL_RULE)),
      'ArrowDown': () => shortcutCommandWrapper(this.editor, blockArrowDownCommand(NodeName.HORIZONTAL_RULE)),
    };
  },

  // -- Input ----------------------------------------------------------------------
  addInputRules() { return [nodeInputRule({ find: horizontalRuleRegEx, type: this.type })];},

  // -- View ----------------------------------------------------------------------
  parseHTML() { return [ { tag: `hr[${DATA_NODE_TYPE}="${NodeName.HORIZONTAL_RULE}"]` } ]; },
  renderHTML({ node, HTMLAttributes }) { return getNodeOutputSpec(node, HTMLAttributes); },
});
