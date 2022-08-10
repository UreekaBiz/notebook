import { EditorState } from 'prosemirror-state';

import { createApplicationError } from '../../util/error';
import { isBlank } from '../../util/string';
import { NotebookDocumentContent } from './document';
import { isDocumentNode, DocumentNodeType } from './extension/document';
import { contentToNode } from './node';
import { getSchema, NotebookSchemaVersion } from './schema';

// ********************************************************************************
// creates an instance of EditorState using the defined structure
const createEditorState = (schemaVersion: NotebookSchemaVersion, doc?: DocumentNodeType): EditorState => {
  const schema = getSchema(schemaVersion);

  return EditorState.create({ schema, doc });
};

// creates an instance of EditorState with the given content. If no content is
// provided, an empty State is created. If the content is invalid then `undefined`
export const getEditorState = (schemaVersion: NotebookSchemaVersion, content?: NotebookDocumentContent): EditorState => {
  // create State without initial content if not present
  if(isBlank(content)) return createEditorState(schemaVersion);
  // else -- content is defined

  // creates a Node with the content
  const schema = getSchema(schemaVersion);
  const node = contentToNode(schema, content);
  if(!node || !isDocumentNode(node)) throw createApplicationError('functions/invalid-argument', `Invalid content while creating Editor state.`);

  return createEditorState(schemaVersion, node);
};
