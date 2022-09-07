import { Extension } from '@tiptap/core';

import { ExtensionName, ExtensionPriority, NoOptions, NoStorage } from 'notebookEditor/model/type';

import { InputRule as InputRuleInstance, inputRulePlugin, stringHandler } from './plugin';

// ********************************************************************************
// == Constant ====================================================================
// an array of objects that, when typed, get replaced by a specific character
// that specify a RegExp and a text to replace the typed characters when the
// RegExp matches
const inputRules: { find: RegExp; replaceWith: string; }[] = [
  { find: /<-$/, replaceWith: '←' },
  { find: /->$/, replaceWith: '→' },
];

// == Extension ===================================================================
export const InputRule = Extension.create<NoOptions, NoStorage>({
  name: ExtensionName.INPUT_RULE/*Expected and guaranteed to be unique*/,
  priority: ExtensionPriority.INPUT_RULE,

  // -- Plugin --------------------------------------------------------------------
  addProseMirrorPlugins() { return [ inputRulePlugin({ rules: inputRules.map(rule => createTextInputRule(rule.find, rule.replaceWith)) }) ]; },
});

// == Util ========================================================================
// creates a Text Input Rule that also works within Nodes that have the
// code property
const createTextInputRule = (find: RegExp, replaceWith: string): InputRuleInstance => new InputRuleInstance(find, stringHandler(replaceWith));
