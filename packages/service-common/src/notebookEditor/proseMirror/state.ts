import { EditorState } from 'prosemirror-state';

import { DocumentNodeType } from './extension/document';
import { getSchema, NotebookSchemaVersion } from './schema';

// ********************************************************************************
// creates an instance of EditorState using the defined structure
export const createEditorState = (schemaVersion: NotebookSchemaVersion, doc?: DocumentNodeType): EditorState => {
  const schema = getSchema(schemaVersion);

  return EditorState.create({ schema, doc });
};
