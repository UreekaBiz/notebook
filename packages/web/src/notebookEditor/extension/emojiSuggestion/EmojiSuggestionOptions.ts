import { ReactRenderer } from '@tiptap/react';
import { PluginKey } from 'prosemirror-state';
import { RefAttributes } from 'react';
import tippy, { Instance as TippyInstance, Props as TippyProps } from 'tippy.js';

import { insertContentAtCommand } from 'notebookEditor/command/node';

import { EmojiSuggestionForwardedObject, EmojiSuggestionList, EmojiSuggestionListProps } from './component/EmojiSuggestionList';
import { isValidClientRect, SuggestionOptions, SuggestionSymbol } from './suggestion/type';
import { emojiSymbols } from './symbol';

// ********************************************************************************
// == Type ========================================================================
type EmojiSuggestionOptionsComponent = ReactRenderer<EmojiSuggestionForwardedObject, EmojiSuggestionListProps & RefAttributes<EmojiSuggestionForwardedObject>>;

// == Suggestion Options ==========================================================
export const emojiSuggestionOptions: Omit<SuggestionOptions<SuggestionSymbol>, 'editor'> = {
  // -- General -------------------------------------------------------------------
  pluginKey: new PluginKey('emojiCompletionKey'),
  char: '@',
  items: emojiSymbols,

  startOfLine: false/*show regardless of whether or not Selection is at the start of a line*/,

  allow: () => true/*allow any match*/,
  allowSpaces: false/*disallow spaces on suggested items*/,
  allowedPrefixes: [' ']/*default allowed prefix characters to trigger the Suggestions*/,

  decorationTag: 'span'/*default*/,
  decorationClass: ''/*none since styling is managed on the component*/,

  // -- Command -------------------------------------------------------------------
  command: (editor, range, suggestionSymbol) => {
    const { from, to } = range;
    const result = insertContentAtCommand({ from, to }, suggestionSymbol.symbol)(editor.state, editor.view.dispatch);
    editor.view.focus();
    return result;
  },

  // -- Render --------------------------------------------------------------------
  createRenderer: () => {
    let component: ReactRenderer<EmojiSuggestionForwardedObject, EmojiSuggestionListProps & RefAttributes<EmojiSuggestionForwardedObject>>;
    let tippyPopup: TippyInstance<TippyProps>;

    return {
      // -- Lifecycle -------------------------------------------------------------
      onStart: (props) => {
        component = new ReactRenderer(EmojiSuggestionList, { editor: props.editor, props });
        const { clientRect } = props;
        if(!isValidClientRect(clientRect)) return/*not a valid clientRect function, nothing to do*/;

        tippyPopup = tippy('body', {
          getReferenceClientRect: clientRect,
          appendTo: () => document.body,
          content: component.element,
          showOnCreate: true/*as soon as possible*/,
          interactive: true/*User can interact with tippyPopup*/,
          trigger: 'manual'/*triggered by text input*/,
          placement: 'bottom-start'/*T&E*/,
        })[0];
      },

      onUpdate: (props) => {
        const { clientRect } = props;
        if(!isValidClientRect(clientRect)) return/*not a valid clientRect function, nothing to do*/;
        try {
          component.updateProps(props);
          tippyPopup.setProps({ getReferenceClientRect: clientRect });
        } catch(error) {
          console.warn(`Error on EmojiSuggestion Rendering: ${error}`);
        }
      },

      onKeyDown: (props) => {
        try {
          if(!component.ref) return false/*ref not set yet*/;

          if(props.event.key === 'Escape') {
            tippyPopup.hide();
            return true/*nothing left to do*/;
          }/* else -- not trying to hide the tippyPopup */

          return component.ref.onKeyDown(props);
        } catch(error) {
          console.warn(`Error on EmojiSuggestion Rendering: ${error}`);
          return false/*something went wrong*/;
        }
      },

      onExit: () => destroyPopup(tippyPopup, component),
    };
  },

  // -- Item Filtering ------------------------------------------------------------
  getItems: (props) =>
    emojiSymbols.filter(symbol =>
        formatTrigger(symbol.trigger)
          .toLowerCase()
          .startsWith(props.query.toLowerCase()))
          .slice(0, 10/*only show first 10 matches*/)
          .sort(sortByFilterString),
};

// == Util ========================================================================
// REF: https://stackoverflow.com/questions/15593850/sort-array-based-on-object-attribute-javascript
// returns a sorted array of SuggestionSymbols based on their formatted trigger
const sortByFilterString = (objA: SuggestionSymbol, objB: SuggestionSymbol) => {
  if(formatTrigger(objA.trigger).slice(1/*remove '\'*/) < formatTrigger(objB.trigger).slice(1/*remove '\'*/)) return -1;
  else if(formatTrigger(objA.trigger).slice(1/*remove '\'*/) > formatTrigger(objB.trigger).slice(1/*remove '\'*/)) return 1;
  else return 0;
};

// remove the '\' from the trigger (note that it is escaped on the definition)
// (SEE: symbol.ts)
const formatTrigger = (trigger: string) => trigger.substring(1/*remove '\'*/);

// remove the tippy popup, unmount the component
const destroyPopup = (tippyPopup: TippyInstance<TippyProps>, component: EmojiSuggestionOptionsComponent) => {
  try {
    tippyPopup.destroy();
    component.destroy();
    return false/*allow default event behavior to be handled by PM*/;
  } catch(error) {
    console.warn(`Error on EmojiSuggestion Rendering: ${error}`);
    return false/*allow default event behavior to be handled by PM*/;
  }
};
