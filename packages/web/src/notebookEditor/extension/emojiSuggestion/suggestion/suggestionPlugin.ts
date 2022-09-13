import { Editor, Range } from '@tiptap/core';
import { EditorState, Plugin, Transaction } from 'prosemirror-state';
import { Decoration, DecorationSet, EditorView } from 'prosemirror-view';

import { generateUUID, NotebookSchemaType } from '@ureeka-notebook/web-service';

import { findSuggestionMatch } from '../util';
import { SuggestionOptions, SuggestionProps } from './type';

// ********************************************************************************
// REF: https://github.com/ueberdosis/tiptap/blob/main/packages/suggestion/src/suggestion.ts

// == Constant ====================================================================
const DATA_SUGGESTION_ID = 'data-suggestion-id';

// == Class =======================================================================
class SuggestionState {
  constructor(
    public active: boolean,
    public range: Range,
    public query: string,
    public text: string,
    public composing: boolean,
    public decorationId: string
  ) {/*nothing additional*/}

  // produce a new Plugin state
  apply = (tr: Transaction, thisPluginState: SuggestionState, oldEditorState: EditorState, newEditorState: EditorState, editor: Editor, suggestionOptions: SuggestionOptions) => {
    const { isEditable } = editor;
    const { composing } = editor.view;
    const { selection } = tr;
    const { empty, from } = selection;

    const nextPluginState = { ...thisPluginState };
    nextPluginState.composing = composing;

    // only suggest if the view is editable and there is no
    // selection or composition active
    // (SEE: https://github.com/ueberdosis/tiptap/issues/1449)
    if(isEditable && (empty || editor.view.composing)) {
      // reset active state if the previous suggestion range was left
      if(((from < thisPluginState.range.from) || from > thisPluginState.range.to) && !composing && !thisPluginState.composing) {
        nextPluginState.active = false;
      } /* else -- do not reset active state */

      // try to match against the current cursor position
      const { char, allowSpaces, allowedPrefixes, startOfLine } = suggestionOptions;
      const match = findSuggestionMatch({ char, allowSpaces, allowedPrefixes, startOfLine, $position: selection.$from });
      const decorationId = generateUUID();

      // if a match was found, update the state to show it
      if(match && suggestionOptions.allow({ editor, state: newEditorState, range: match.range })) {
        nextPluginState.active = true;
        nextPluginState.decorationId = thisPluginState.decorationId ? thisPluginState.decorationId : decorationId;
        nextPluginState.range = match.range;
        nextPluginState.query = match.query;
        nextPluginState.text = match.text;
      } else {
        nextPluginState.active = false/*no match was found*/;
      }

    } else {
      nextPluginState.active = false/*by definition, since View is not editable or a composition event is happening*/;
    }

    // reset the state if Suggestion is inactive
    if(!nextPluginState.active) {
      nextPluginState.decorationId = ''/*none*/;
      nextPluginState.range = { from: 0, to: 0 };
      nextPluginState.query = ''/*none*/;
      nextPluginState.text = ''/*none*/;
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
  const suggestionPlugin: Plugin<SuggestionState, NotebookSchemaType> = new Plugin<SuggestionState, NotebookSchemaType>({
    // -- Setup -------------------------------------------------------------------
    key: pluginKey,

    // -- State -------------------------------------------------------------------
    state: {
      // initialize the plugin state
      init: (_, state) => {
        return new SuggestionState(
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
          } /* else -- User did not try to exit, check for updates */

          if(handleChange) {
            renderer?.onUpdate?.(props);
          } /* else -- check for reset (a new start) */

          if(handleStart) {
            renderer?.onStart?.(props);
          } /* else -- nothing left to check, do nothing */
        },

        destroy: () => {
          if(!props) {
            return/*nothing to do*/;
          } /* else -- props given, do onExit behavior */

          renderer.onExit?.(props);
        },
      };
    },

    // -- Props -------------------------------------------------------------------
    props: {
      // call the keydown hook if Suggestion is active
      handleKeyDown: (view: EditorView, event: KeyboardEvent) => {
        const { active, range } = suggestionPlugin.getState(view.state);
        if(!active) return false/*Suggestion not active, let PM handle the event*/;

        return renderer.onKeyDown?.({ view, event, range }) || false/*let PM handle the event*/;
      },

      // setup the decorator on the currently active Suggestion
      decorations: (state: EditorState) => {
        const { active, range, decorationId } = suggestionPlugin.getState(state);
        if(!active) return null/*Suggestion not active, nothing to do*/;

        return DecorationSet.create(state.doc, [
          Decoration.inline(range.from, range.to, { nodeName: decorationTag, class: decorationClass, [`${DATA_SUGGESTION_ID}`]: decorationId }),
        ]);
      },
    },
  });

  return suggestionPlugin;
};

