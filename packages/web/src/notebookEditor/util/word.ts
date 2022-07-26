import { Editor } from '@tiptap/core';
import { Range } from '@tiptap/react';

// ********************************************************************************
/**
 * @param editor the instance of the editor (its current state)
 * @returns A range with the start and end positions of the word where the cursor
 *         is currently set
 */
export const getCurrentWordRange = (editor: Editor): Range => {
  let backwardsSet = false/*default not set*/,
      forwardSet = false/*default not set*/;
  let moveBackwards = 0,
      moveForward = 0;

  const textOffsetPosition = editor.state.selection.$anchor.textOffset;
  if(textOffsetPosition === 0) {
    // there are two cases where this is true:
    // - the focus is at the start of a text node or
    // - the focus is at the end of a text node
    // if it is at the end, this explicitly chooses to do nothing
    // if it is at the start, set 'backwardsSet' to true
    backwardsSet = true;
  } /* else -- not at offset 0 */

  let textContent = '';
  textContent += editor.state.selection.$anchor.nodeBefore?.text;
  textContent += editor.state.selection.$anchor.nodeAfter?.text;
  if(textContent === '') return { from: 0, to: 0 }/*no text content*/;
  if(textContent[textOffsetPosition] === ' ') return { from: 0, to: 0 }/*return empty range if in whitespace*/;

  if(backwardsSet === false) {
    for(let i=textOffsetPosition; i>0; i--) { /*get lower limit*/
      if(textContent[i] !== ' ') moveBackwards++;
      else break/*done*/;
    }
    moveBackwards--/*indexing differences*/;
  } /* else -- 'backwardsSet' has been set */
  // FIXME: 'forwardSet' is never *not* 'false' -- why is this checked?
  if(forwardSet === false) {
    for(let i=textOffsetPosition; i<=textContent.length-1; i++) { /*get upper limit*/
      if(textContent[i] !== ' ') moveForward++;
      else break/*boundary reached*/;
    }
  } /* else -- 'forwardSet' has been set */

  const { pos } = editor.state.selection.$anchor;
  const wordStart = pos - moveBackwards;
  const wordEnd = pos + moveForward;
  return { from: wordStart, to: wordEnd };
};
