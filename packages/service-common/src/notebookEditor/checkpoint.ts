import { EditorState } from 'prosemirror-state';

import { NotebookDocumentContent } from './proseMirror/document';
import { getSchema, NotebookSchemaVersion } from './proseMirror/schema';
import { contentToNode } from './proseMirror/node';
import { getContentFromDocAndVersions } from './content';
import { Checkpoint, NotebookVersion, NO_NOTEBOOK_VERSION } from './type';

// ********************************************************************************
export const getLastCheckpointIndex = (checkpoint: Checkpoint | undefined/*none*/) => (checkpoint === undefined) ? NO_NOTEBOOK_VERSION/*by contract*/ : checkpoint.index;

// ================================================================================
// collapses the specified Checkpoint with the specified NotebookVersions (of which
// there may be none as the Checkpoint may include the last Version)
// NOTE: if any of the NotebookVersions fails to parse they can be safely ignored
//       since all Clients will have the same Schema and will be also ignored
// CHECK: is that true?!? What about after a version update where not all clients
//        are at the same version? Specifically, how *are* clients upgraded safely?
export const collapseVersions = (schemaVersion: NotebookSchemaVersion, checkpoint: Checkpoint | undefined/*none*/, versions: NotebookVersion[]): NotebookDocumentContent => {
  const schema = getSchema(schemaVersion);
  const previousDocument = contentToNode(schema, checkpoint?.content);
  const editorState = EditorState.create({ schema, doc: previousDocument });

  // generate a new Document for each NotebookVersion using the previously generated Document
  let { doc } = editorState;
  return getContentFromDocAndVersions(schemaVersion, doc, versions);
};
