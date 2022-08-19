import { Node as ProseMirrorNode, Schema } from 'prosemirror-model';
import { EditorState } from 'prosemirror-state';

// ********************************************************************************
// creates an instance of EditorState using the defined structure
export const createEditorState = (schema: Schema, doc?: ProseMirrorNode): EditorState => {
  return EditorState.create({ schema, doc });
};
