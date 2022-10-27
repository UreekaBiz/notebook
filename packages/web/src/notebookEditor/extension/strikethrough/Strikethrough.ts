import { Mark } from '@tiptap/core';

import { getMarkOutputSpec, NodeName, StrikethroughMarkSpec } from '@ureeka-notebook/web-service';

import { shortcutCommandWrapper } from 'notebookEditor/command/util';
import { markInputRule, markPasteRule } from 'notebookEditor/extension/util/mark';
import { NoOptions, NoStorage } from 'notebookEditor/model/type';

import { safeParseTag } from '../util/parse';
import { toggleStrikethroughCommand } from './command';

// ********************************************************************************
// REF: https://github.com/ueberdosis/tiptap/blob/main/packages/extension-strike/src/strike.ts

// == RegEx =======================================================================
const strikethroughInputRegEx = /(?:^|\s)((?:~~)((?:[^~]+))(?:~~))$/;
const strikethroughPasteRegEx = /(?:^|\s)((?:~~)((?:[^~]+))(?:~~))/g;

// == Mark ========================================================================
export const Strikethrough = Mark.create<NoOptions, NoStorage>({
  ...StrikethroughMarkSpec,

  // -- Keyboard Shortcut ---------------------------------------------------------
  addKeyboardShortcuts() { return { 'Mod-Shift-x': () => shortcutCommandWrapper(this.editor, toggleStrikethroughCommand) }; },

  // -- Input ---------------------------------------------------------------------
  // apply the strikethrough mark to any text that is typed or pasted in between
  // '~~' symbols, or when pasting text wrapped in them
  addInputRules() { return [ markInputRule(strikethroughInputRegEx, this.type ) ]; },
  addPasteRules() { return [ markPasteRule(strikethroughPasteRegEx, this.type ) ]; },

  // -- View ----------------------------------------------------------------------
  parseHTML() {
    return [
      safeParseTag('s'),
      safeParseTag('del'),
      safeParseTag('strike'),
      {
        style: 'text-decoration',
        consuming: false/*allow other rules to keep matching after this one matches*/,
        getAttrs: (style) => (typeof style === 'string' && style.includes('line-through') ? {/*match, with no attributes*/} : false/*don't match rule*/),

        // since the Strikethrough Mark may be parsed from text-decoration: line-through;
        // or other tags (e.g. 's', 'del', 'strike', and so on), yet it is also set as
        // CSS for TaskListItems, define the context in which the ParseRules are valid,
        // which are specific Text Blocks
        context: `${NodeName.BLOCKQUOTE} | ${NodeName.CODEBLOCK}/ | ${NodeName.DEMO_2_ASYNC_NODE}/ | ${NodeName.HEADING}/ | ${NodeName.PARAGRAPH}/`,
      },
    ];
  },
  renderHTML({ mark, HTMLAttributes }) { return getMarkOutputSpec(mark, HTMLAttributes); },
});
