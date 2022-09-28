import { Editor, Range } from '@tiptap/core';
import { EditorState, Plugin, Transaction } from 'prosemirror-state';
import { Decoration, DecorationSet, EditorView } from 'prosemirror-view';

import { generateUUID } from '@ureeka-notebook/web-service';

import { findSuggestionMatch } from '../util';
import { SuggestionOptions, SuggestionProps } from './type';

// ********************************************************************************
// REF: https://github.com/ueberdosis/tiptap/blob/main/packages/suggestion/src/suggestion.ts

// == Constant ====================================================================
const DATA_SUGGESTION_ID = 'data-suggestion-id';

// MetaData that gets appended to a Transaction the first time the User inputs
// the Suggestion trigger character so that future possible Suggestions are shown.
// A Transaction that sets it back to false should be dispatched from the
// Command / onExit behavior of of the Suggestion Options so that the
// Suggestion is no longer shown. This ensures that the Suggestion is shown
// only the first time the User types the trigger character
export const SHOULD_SHOW_SUGGESTION_META = 'shouldShowSuggestion';

// == Class =======================================================================
class SuggestionState {
  constructor(
    public shouldShowSuggestion: boolean,
    public active: boolean,
    public range: Range,
    public query: string,
    public text: string,
    public composing: boolean,
    public decorationId: string
  ) {/*nothing additional*/}

  // produce a new Plugin state
  apply = (tr: Transaction, thisPluginState: SuggestionState, oldEditorState: EditorState, newEditorState: EditorState, editor: Editor, suggestionOptions: SuggestionOptions) => {
    // NOTE: checking for strict boolean values since a value of 'undefined'
    //       should not modify this prop of the SuggestionState,
    //       as various Transactions without the Metadata can be dispatched in between
    if(tr.getMeta(SHOULD_SHOW_SUGGESTION_META) === true) {
      thisPluginState.shouldShowSuggestion = true;
    } /* else -- check for false */
    if(tr.getMeta(SHOULD_SHOW_SUGGESTION_META) === false) {
      thisPluginState.shouldShowSuggestion = false;
    } /* else -- maintain current state across Transactions */

    const { isEditable } = editor;
    const { composing } = editor.view;
    const { selection } = tr;
    const { empty, from } = selection;

    const nextPluginState = { ...thisPluginState };
    nextPluginState.composing = composing;

    if(!isEditable || !empty) {
      return resetSuggestionState(nextPluginState);
    } /* else -- the View is editable and there is no multiple Selection */

    // change active state if the previous Suggestion Range was left
    if(((from < thisPluginState.range.from) || from > thisPluginState.range.to) && !composing && !thisPluginState.composing) {
      nextPluginState.active = false;
    } /* else -- do not change active state */

    // try to match against the current cursor position
    const { char, allowSpaces, allowedPrefixes, startOfLine } = suggestionOptions;
    const match = findSuggestionMatch({ char, allowSpaces, allowedPrefixes, startOfLine, $position: selection.$from });
    const decorationId = generateUUID();

    // if a match was found, update the state to show it
    if(match && nextPluginState.shouldShowSuggestion) {
      nextPluginState.active = true;
      nextPluginState.decorationId = thisPluginState.decorationId ? thisPluginState.decorationId : decorationId;
      nextPluginState.range = match.range;
      nextPluginState.query = match.query;
      nextPluginState.text = match.text;
    } else {
      nextPluginState.active = false/*no match was found*/;
    }

    // reset the state if Suggestion is inactive
    if(!nextPluginState.active) {
      return resetSuggestionState(nextPluginState);
    } /* else -- no need to reset the Plugin state */

    return nextPluginState/*updated the Plugin state*/;
  };
}

// == Plugin ======================================================================
// return a Plugin that receives a suggestionOptions object and displays the
// configured component, which implements the required behavior so that the
// User can choose among the SuggestionOptions, which trigger a configured Command
// when they are selected
export const suggestionPlugin = <I = any>(suggestionOptions: SuggestionOptions<I>) => {
  const { editor, pluginKey, createRenderer, getItems, command, decorationTag, decorationClass } = suggestionOptions;

  let props: SuggestionProps<I>;
  const renderer = createRenderer();

  // -- Implementation ------------------------------------------------------------
  const suggestionPlugin: Plugin<SuggestionState> = new Plugin<SuggestionState>({
    // -- Setup -------------------------------------------------------------------
    key: pluginKey,

    // -- State -------------------------------------------------------------------
    state: {
      // initialize the plugin state
      init: (_, state) => {
        return new SuggestionState(
          false/*default should not show Suggestion*/,
          false/*default not active*/,
          { from: 0, to:0 }/*default Range*/,
          ''/*default no query*/,
          ''/*default no text*/,
          false/*default not composing*/,
          ''/*default no decorationId*/
        );
      },

      // apply changes to the plugin state from a view transaction
      apply(transaction, thisPluginState, oldState, newState) { return thisPluginState.apply(transaction, thisPluginState, oldState, newState, editor, suggestionOptions); },
    },

    // -- View ---------------------------------------------------------------------
    view() {
      return {
        update: async (view: EditorView, prevState: EditorState) => {
          const previousPluginState = this.key?.getState(prevState);
          const currentPluginState = this.key?.getState(view.state);
          if(!previousPluginState || !currentPluginState) return/*invalid states, nothing to do*/;

          // see how the Plugin state changed
          const selectionMoved = previousPluginState.active && currentPluginState.active && previousPluginState.range.from !== currentPluginState.range.from;
          const suggestionStarted = !previousPluginState.active && currentPluginState.active;
          const suggestionStopped = previousPluginState.active && !currentPluginState.active;
          const suggestionChanged = !suggestionStarted && !suggestionStopped && previousPluginState.query !== currentPluginState.query;

          const handleStart = suggestionStarted || selectionMoved;
          const handleChange = suggestionChanged && !selectionMoved;
          const handleExit = suggestionStopped || selectionMoved;

          // cancel when suggestion is not active
          if(!handleStart && !handleChange && !handleExit) return/*Suggestion not active, nothing to do*/;

          let currentState: SuggestionState;
          if(handleExit && !handleStart) {
            currentState = previousPluginState;
          } else {
            currentState = currentPluginState;
          }

          const decorationNode = view.dom.querySelector(`[${DATA_SUGGESTION_ID}="${currentState.decorationId}"]`);
          props = { editor,
            range: currentState.range,
            query: currentState.query,
            text: currentState.text,
            items: suggestionOptions.items,
            command: (commandProps) => command(editor, currentState.range, commandProps),
            decorationNode,
            clientRect: decorationNode
              ? () => {
                // since `items` can be asynchronous, look for the current decoration node
                const thisPluginState = this.key?.getState(editor.state);
                if(!thisPluginState) return null/*nothing to show*/;

                const { decorationId } = thisPluginState;
                const currentDecorationNode = view.dom.querySelector(`[${DATA_SUGGESTION_ID}="${decorationId}"]`);

                return currentDecorationNode?.getBoundingClientRect() || null/*nothing to show*/;
              }
              : null/*nothing to show*/,
          };

          // NOTE: the order of the checks below is NOT arbitrary, it follows
          //       the lifecycle of updates
          if(handleStart) {
            renderer?.onBeforeStart?.(props);
          } /* else check for onBeforeUpdate */

          if(handleChange) {
            renderer?.onBeforeUpdate?.(props);
          } /* else -- update shown items */

          if(handleChange || handleStart) {
            props.items = await getItems({ editor, query: currentState.query });
          } /* else -- check for onExit */

          if(handleExit) {
            renderer?.onExit?.(props);
            hideSuggestion(view)/*ensure suggestion is no longer shown*/;
          } /* else -- User did not try to exit, check for updates */

          if(handleChange) {
            renderer?.onUpdate?.(props);
          } /* else -- check for reset (a new start) */

          if(handleStart) {
            renderer?.onStart?.(props);
          } /* else -- nothing left to check, do nothing */
        },

        // called when the whole View gets destroyed
        destroy: () => {
          if(!props) {
            return/*nothing to do*/;
          } /* else -- props given, do onExit behavior */

          renderer.onExit?.(props);
          hideSuggestion(props.editor.view)/*ensure suggestion is no longer shown*/;
        },
      };
    },

    // -- Props -------------------------------------------------------------------
    props: {
      // call the keydown hook if Suggestion is active
      handleKeyDown: (view: EditorView, event: KeyboardEvent) => {
        // allow the Suggestion to be shown
        if(event.key === suggestionOptions.char) {
          view.dispatch(view.state.tr.setMeta(SHOULD_SHOW_SUGGESTION_META, true));
          return false/*let PM handle the event*/;
        } /* else -- check if the Suggestion is already active */

        const pluginState = suggestionPlugin.getState(view.state);
        if(!pluginState) return false/*Suggestion not active, let PM handle the event*/;

        const { active, range } = pluginState;
        if(!active) return false/*Suggestion not active, let PM handle the event*/;

        return renderer.onKeyDown?.({ view, event, range }) || false/*let PM handle the event*/;
      },

      // setup the decorator on the currently active Suggestion
      decorations: (state: EditorState) => {
        const pluginState = suggestionPlugin.getState(state);
        if(!pluginState) return null/*nothing to do*/;

        const { active, range, decorationId } = pluginState;
        if(!active) return null/*Suggestion not active, nothing to do*/;

        return DecorationSet.create(state.doc, [
          Decoration.inline(range.from, range.to, { nodeName: decorationTag, class: decorationClass, [`${DATA_SUGGESTION_ID}`]: decorationId }),
        ]);
      },
    },
  });

  return suggestionPlugin;
};

// == Util ========================================================================
// reset the Suggestion state. Note that this function does not change the
// 'shouldShow' SuggestionState property since that should remain constant
// across different Transactions, until another one sets it back to false
// (SEE: SHOULD_SHOW_META)
const resetSuggestionState = (suggestionState: SuggestionState) => {
  suggestionState.active = false/*default*/;
  suggestionState.decorationId = ''/*none*/;
  suggestionState.range = { from: 0, to: 0 };
  suggestionState.query = ''/*none*/;
  suggestionState.text = ''/*none*/;
  return suggestionState;
};

// dispatch a Transaction whose Metadata indicates that the Suggestion should
// no longer be shown. (SEE: SHOULD_SHOW_SUGGESTION_META)
const hideSuggestion = (view: EditorView) => view.dispatch(view.state.tr.setMeta(SHOULD_SHOW_SUGGESTION_META, false));
