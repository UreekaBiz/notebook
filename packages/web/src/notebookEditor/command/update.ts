import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';

import { AbstractDocumentUpdate } from '@ureeka-notebook/web-service';

// ********************************************************************************
/**
 * Performs the functionality of the given {@link AbstractDocumentUpdate}s in a
 * 'single change' through the history
 */
export const applyDocumentUpdates = (view: EditorView, documentUpdates: AbstractDocumentUpdate[], startingState: EditorState) => {
  let currentState = startingState/*default*/;

  for(let i=0; i<documentUpdates.length; i++) {
    const newTr = documentUpdates[i].update(currentState, currentState.tr);
    currentState = currentState.apply(newTr);
  }

  view.updateState(currentState);
};
