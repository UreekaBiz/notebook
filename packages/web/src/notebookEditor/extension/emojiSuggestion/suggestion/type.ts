import { Editor, Range } from '@tiptap/core';
import { PluginKey } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';

// ********************************************************************************
// -- Symbol ----------------------------------------------------------------------
// represents a valid Symbol that can be inserted by a Suggestion
export type SuggestionSymbol = {
  // the Symbol that gets inserted (or another specific behavior)
  // when the User selects a Suggestion
  symbol: string;

  // the Symbol's command
  trigger: string;
};

// -- Match -----------------------------------------------------------------------
export type SuggestionMatch = {
  // the range matched by the trigger of the Suggestion
  range: Range;

  // the currently typed text by the user when querying the Suggestions
  query: string;

  // the text that gets matched
  text: string;
} | null/*not a valid match*/;

// == Options =====================================================================
export type SuggestionOptions<I = any> = {
  // the PluginKey for the specific instance of the Suggestion Plugin
  pluginKey: PluginKey;

  // the current Editor instance
  editor: Editor;

  // the character that triggers the display behavior of the Suggestion component
  char: string;

  // allow or disallow spaces in the suggested items
  allowSpaces: boolean;

  // the prefixes that are allowed to trigger a Suggestion
  allowedPrefixes: string[] | null;

  // whether the popup should be triggered at the start of a line only
  startOfLine: boolean;

  // the HTML tag that should be rendered for the Suggestion
  decorationTag: string;

  // the CSS class that should be added to the Suggestion
  decorationClass: string;

  // the Command that gets executed when the User chooses a Suggestion
  command: (editor: Editor, range: Range, props: I) => void;

  // the available items the User can choose from, which get filtered by the
  // component of the Suggestion
  items: I[];

  // a function that returns the items among which the User can choose from
  // given the current query (User input)
  getItems: (props: { query: string; editor: Editor; }) => I[] | Promise<I[]>;

  // function that returns the renderer for the popup
  createRenderer: () => {
    onBeforeStart?: (props: SuggestionProps<I>) => void;
    onStart?: (props: SuggestionProps<I>) => void;
    onBeforeUpdate?: (props: SuggestionProps<I>) => void;
    onUpdate?: (props: SuggestionProps<I>) => void;
    onExit?: (props: SuggestionProps<I>) => void;
    onKeyDown?: (props: SuggestionKeyDownProps) => boolean;
  };
};

// -- Props -----------------------------------------------------------------------
// the props received by the handler functions of a Suggestion object definition
export type SuggestionProps<I = any> = {
  // the current Editor instance
  editor: Editor;

  // the range covering the text that could potentially be replaced
  range: Range;

  // the User's text query for the looked-for Suggestion
  query: string;

  // the text that triggers the Suggestion List
  text: string;

  // the resulting items after having performed the query
  items: I[];

  // the Command that gets executed if the User chooses the Suggestion
  command: (props: I) => void;

  // the Element that displays the Suggestions
  decorationNode: Element | null;

  // virtual node for popper.js or tippy.js
  // used to build popups without a DOM node
  clientRect?: (() => DOMRect | null) | null;
};

// -- Keydown Props ---------------------------------------------------------------
// the props received by the keydown handler functions of
// a Suggestion object definition
export type SuggestionKeyDownProps = { view: EditorView; event: KeyboardEvent; range: Range; }

// Type guard so that the popup created by TippyJS validates that the given
// clientRect function passed by SuggestionProps is legitimate
type GetDOMRectFunctionType = () => DOMRect;
export const isValidClientRect = (clientRectFunction: any): clientRectFunction is GetDOMRectFunctionType => clientRectFunction !== null && clientRectFunction() !== null;
