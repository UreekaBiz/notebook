import { EditorState } from 'prosemirror-state';

import { isObject } from '../util';

// ********************************************************************************
/** Type guard that defines if a value is a {@link EditorState} */
export const isEditorState = (value: unknown): value is EditorState => {
  return isObject(value) && value instanceof EditorState;
};
