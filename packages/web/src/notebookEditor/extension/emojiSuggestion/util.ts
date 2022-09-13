import { escapeForRegEx } from '@tiptap/core';
import { ResolvedPos } from 'prosemirror-model';

import { SuggestionMatch, SuggestionOptions } from './suggestion/type';

// ********************************************************************************
// REF: https://github.com/ueberdosis/tiptap/blob/main/packages/suggestion/src/findSuggestionMatch.ts

// == Type ========================================================================
type TriggerConfig = {
  char: SuggestionOptions['char'];
  allowSpaces: SuggestionOptions['allowSpaces'];
  allowedPrefixes: SuggestionOptions['allowedPrefixes'];
  startOfLine: SuggestionOptions['startOfLine'];
  $position: ResolvedPos;
}

// == Suggestion Match ============================================================
// check to see if the given configuration trigger configuration matches (and
// hence a Suggestion is considered to be active), given a ResolvedPosition
// (SEE: suggestionPlugin.ts)
export const findSuggestionMatch = (config: TriggerConfig): SuggestionMatch => {
  const { char, allowSpaces, allowedPrefixes, startOfLine, $position } = config;

  const escapedChar = escapeForRegEx(char)/*create a regEx that matches the given char*/;
  const suffix = new RegExp(`\\s${escapedChar}$`);
  const prefix = startOfLine ? '^' : '';
  const regexp = allowSpaces
    ? new RegExp(`${prefix}${escapedChar}.*?(?=\\s${escapedChar}|$)`, 'gm')
    : new RegExp(`${prefix}(?:^)?${escapedChar}[^\\s${escapedChar}]*`, 'gm');

  const text = $position.nodeBefore?.isText && $position.nodeBefore.text;
  if(!text) return null/*not a valid match*/;

  const textFrom = $position.pos - text.length;
  const match = Array.from(text.matchAll(regexp)).pop()/*get last matched element*/;
  if(!match || match.input === undefined || match.index === undefined) return null/*not a valid match*/;

  // since JavaScript doesn't have look-behinds, check that the
  // first character is a space or the start of the line
  const matchPrefix = match.input.slice(Math.max(0, match.index - 1), match.index);
  const matchPrefixIsAllowed = new RegExp(`^[${allowedPrefixes?.join('')}\0]?$`).test(matchPrefix);
  if(allowedPrefixes !== null && !matchPrefixIsAllowed) return null/*not a valid match*/;

  // The absolute position of the match in the document
  const from = textFrom + match.index;
  let to = from + match[0].length;

  // if spaces are allowed and selection is directly between two triggers
  if(allowSpaces && suffix.test(text.slice(to - 1/*will add a space*/, to + 1/*account for added space*/))) {
    match[0] += ' ';
    to += 1/*account for added space*/;
  } /* else -- no special handling */

  // if the $position is located within the matched substring, return that range
  if(from < $position.pos && to >= $position.pos) {
    return {
      range: { from, to },
      query: match[0].slice(char.length),
      text: match[0],
    };
  } /* else -- not a valid range */

  return null/*not a valid match*/;
};
