import { EditorState, Plugin, TextSelection, Transaction } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';

// ********************************************************************************
// REF: https://github.com/ProseMirror/prosemirror-inputrules/blob/d60b7920d040e9b18ee893bad4213180fedc47f5/src/inputrules.ts

// == Type ========================================================================
type InputRulePluginState = { transform: Transaction; from: number; to: number; text: string; } | null;
type InputRuleHandler =  (state: EditorState, match: RegExpMatchArray, start: number, end: number) => Transaction | null;

// == Constant ====================================================================
// the maximum length for the match of an InputRule
const MAX_MATCH = 500;

// == Class =======================================================================
// Input rules are regular expressions describing a piece of text
// that, when typed, causes something to happen.
export class InputRule {
  // Create an input rule. The rule applies when the user typed
  // something and the text directly in front of the cursor matches
  // `match`, which should end with `$`.
  //
  // The `handler` can be a string, in which case the matched text, or
  // the first matched group in the regexp, is replaced by that
  // string.
  //
  // Or a it can be a function, which will be called with the match
  // array produced by
  // [`RegExp.exec`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/exec),
  // as well as the start and end of the matched range, and which can
  // return a [transaction](#state.Transaction) that describes the
  // rule's effect, or null to indicate the input was not handled.
  constructor(public readonly match: RegExp, public readonly handler: string | InputRuleHandler) {
    this.handler = typeof handler === 'string'
      ? stringHandler(handler)/*default handler for strings*/
      : handler/*use specified handler*/;
  }
}

// Create an input rules plugin. When enabled, it will cause text
// input that matches any of the given rules to trigger the rule's
// action.
export const inputRulePlugin = ({ rules }: { rules: readonly InputRule[]; }) => {
  const plugin: Plugin<InputRulePluginState> = new Plugin<InputRulePluginState>({
    // -- State -------------------------------------------------------------------
    state: {
      init() { return null/*default no state*/; },
      apply(this: typeof plugin, tr, previousState) {
        const scheduledInsertTextTransaction = tr.getMeta(this);

        if(scheduledInsertTextTransaction) {
          return scheduledInsertTextTransaction;
        } /* else -- no inputRules triggered recently */

        return tr.selectionSet || tr.docChanged ? null/*default*/ : previousState;
      },
    },

    // -- Props -------------------------------------------------------------------
    props: {
      // ensure that the inputRule applies on a given textInput if it matches
      handleTextInput: (view: EditorView, from: number, to: number, text: string) => {
        return executeInputRule(view, from, to, text, rules, plugin);
      },

      // ensure that the inputRules still apply at the end of a composition event
      handleDOMEvents: {
        compositionend: (view: EditorView) => {
          let executed = false/*default*/;
          setTimeout(() => {
            let { $cursor } = view.state.selection as TextSelection;
            if($cursor) {
              executeInputRule(view, $cursor.pos, $cursor.pos, '', rules, plugin);
              executed = true/*executed*/;
            } /* else -- not a TextSelection, do nothing */
          });

          return executed/*default*/;
        },
      },

    },
  });

  return plugin;
};

// == Util ========================================================================
// returns a function that inserts the given string when called from within a
// rule that defines a handler. Extracted since this behavior is the same for
// all string-only inputRules, but there may be times when other actions
// have to be performed
export const stringHandler = (replaceWithString: string) =>
  (state: EditorState, match: RegExpMatchArray, start: number, end: number) => {
    let insertedText = replaceWithString;

    if(match[1/*index*/]) {
      let offset = match[0/*text to replace*/].lastIndexOf(match[1]);
      insertedText += match[0/*text to replace*/].slice(offset + match[1].length);
      start += offset;

      let cutOff = start - end;
      if(cutOff > 0) {
        insertedText = match[0/*text to replace*/].slice(offset - cutOff, offset) + insertedText;
        start = end;
      } /* else -- do not perform cut */
    } /* else -- no need to modify insertedText */

    return state.tr.insertText(insertedText, start, end);
  };

// schedules the execution of an InputRule by setting Metadata on the state of the
// Transaction of the state of the given View, when the Text typed by the
// User is matched by one of the Rules of this Plugin
const executeInputRule = (view: EditorView, from: number, to: number, text: string, rules: readonly InputRule[], plugin: Plugin) => {
  if(view.composing) return false/*do not trigger inputRules during composition events */;

  const state = view.state;
  const $from = state.doc.resolve(from);
  const textBefore = $from.parent.textBetween(Math.max(0, $from.parentOffset - MAX_MATCH), $from.parentOffset, undefined/*no block separator*/, '\ufffc'/*insert for every non Leaf Node*/) + text;

  for(let i = 0; i < rules.length; i++) {
    const match = rules[i].match.exec(textBefore);
    const { handler } = rules[i];

    const tr = match &&  typeof handler === 'function' &&  handler(state, match, from - (match[0].length - text.length), to);
    if(!tr) continue/*this Rule does not specify a handler function or it did not match*/;

    view.dispatch(tr.setMeta(plugin, { transform: tr, from, to, text }));
    return true/*one inputRule was scheduled*/;
  }

  return false/*no inputRules were scheduled*/;
};
