import { Extension } from '@tiptap/react';

import { ExtensionName, ExtensionPriority, NoOptions, NoStorage } from 'notebookEditor/model/type';

import { emojiSuggestionOptions } from './EmojiSuggestionOptions';
import { suggestionPlugin } from './suggestion/suggestionPlugin';

// ********************************************************************************
// displays a Suggestion component so that the User can choose an Emoji Symbol,
// which gets inserted as Text into the Editor

// == Extension ===================================================================
export const EmojiSuggestion = Extension.create<NoOptions, NoStorage>({
  name: ExtensionName.EMOJI_SUGGESTION,
  priority: ExtensionPriority.EMOJI_SUGGESTION,

  // -- Plugin --------------------------------------------------------------------
  addProseMirrorPlugins() { return [suggestionPlugin({ editor: this.editor, ...emojiSuggestionOptions })]; },
});
