import { EditorState } from 'prosemirror-state';

import { isBlank } from '../../util';
import { NotebookDocumentContent } from './document';
import { DocumentNodeType, isDocumentNode } from './extension/document';
import { contentToNode } from './node';
import { getSchema, NotebookSchemaVersion } from './schema';

// ********************************************************************************
// creates an instance of EditorState using the defined structure
const createEditorState = (schemaVersion: NotebookSchemaVersion, doc?: DocumentNodeType): EditorState => {
  const schema = getSchema(schemaVersion);

  return EditorState.create({ schema, doc });
};

// creates an instance of EditorState with the given content. if no content is
// provided, an empty state is created. if the content is invalid undefined.
export const getEditorState = (schemaVersion: NotebookSchemaVersion, content?: NotebookDocumentContent): EditorState | undefined/*invalid state*/ => {
  // create state without initial content if not present
  if(!content || isBlank(content)) return createEditorState(schemaVersion);
  // else -- content is defined

  // creates a node with the content
  const schema = getSchema(schemaVersion);
  const node = contentToNode(schema, content);
  if(!node || !isDocumentNode(node)){ console.error(`Invalid content while creating Editor state.`); return undefined/*invalid state*/; }

  return createEditorState(schemaVersion, node);
};
