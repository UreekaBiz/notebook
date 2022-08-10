import { EditorState } from 'prosemirror-state';

import { createApplicationError } from '../../util/error';
import { NotebookVersion } from '../type';
import { getDocumentFromDocAndVersions } from './document';
import { DocumentNodeType } from './extension/document';
import { getSchema, NotebookSchemaVersion } from './schema';

// ********************************************************************************
// creates an instance of EditorState using the defined structure
export const createEditorState = (schemaVersion: NotebookSchemaVersion, doc?: DocumentNodeType): EditorState => {
  const schema = getSchema(schemaVersion);

  return EditorState.create({ schema, doc });
};

// ================================================================================
export const getEditorStateFromDocAndVersions = (schemaVersion: NotebookSchemaVersion, doc: DocumentNodeType, versions: NotebookVersion[]) => {
  const newDocument = getDocumentFromDocAndVersions(schemaVersion, doc, versions);
  const editorState = createEditorState(schemaVersion, newDocument);
  if(!editorState) throw createApplicationError('data/integrity', `Cannot create Editor State for Notebook (${schemaVersion}) when combining Document and new Versions.`);

  return editorState;
};
