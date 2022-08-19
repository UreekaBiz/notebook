import { NotebookIdentifier, DEFAULT_NOTEBOOK_NAME } from '../../notebook/type';
import { createApplicationError } from '../../util/error';
import { assertNever } from '../../util/type';
import { Checkpoint, NotebookVersion } from '../type';
import { contentToStep } from '../version';
import { DocumentNodeType } from './extension/document';
import { contentToNode } from './node';
import { getSchema, NotebookSchemaVersion } from './schema';
import { createEditorState } from './state';

// ********************************************************************************
// TODO: More specificity than string (this is the JSON.stringified version of the
//       step / document)
export type NotebookDocumentContent = string/*TODO: see TODO above*/;

// ================================================================================
export const getDocumentFromDocAndVersions = (schemaVersion: NotebookSchemaVersion, doc: DocumentNodeType | undefined/*none*/, versions: NotebookVersion[]): DocumentNodeType => {
  const schema = getSchema(schemaVersion);
  let document = doc ?? createEditorState(schema).doc;

  versions.forEach(version => {
    const prosemirrorStep = contentToStep(schemaVersion, version.content);

    // ProseMirror takes a ProsemirrorStep and applies it to the Document as the
    // last Step generating a new Document
    // NOTE: this process can result in failure for multiple reasons such as the
    //       Schema is invalid or the Step tried collide with another Step and the
    //       result is invalid.
    // NOTE: if the process fails then that failed Step can be safely ignored since
    //       the ClientDocument will ignore it as well
    const stepResult = prosemirrorStep.apply(document);
    if(stepResult.failed || !stepResult.doc) { console.error(`Invalid Notebook (${schemaVersion}) Version (${version.index}) '${version.content}' when combining Document and new Versions. Ignoring. Reason: `, stepResult.failed); return/*ignore Version / Step*/; }
    document = stepResult.doc;
  });

  return document;
};

// --------------------------------------------------------------------------------
// collapses the specified Checkpoint with the specified NotebookVersions (of which
// there may be none as the Checkpoint may include the last Version)
// NOTE: if any of the NotebookVersions fails to parse they can be safely ignored
//       since all Clients will have the same Schema and will be also ignored
// CHECK: is that true?!? What about after a version update where not all clients
//        are at the same version? Specifically, how *are* clients upgraded safely?
export const collapseVersions = (schemaVersion: NotebookSchemaVersion, checkpoint: Checkpoint | undefined/*none*/, versions: NotebookVersion[]): DocumentNodeType => {
  // generate a new Document for each NotebookVersion using the previously generated Document
  const schema = getSchema(schemaVersion);
  const checkpointDocument = contentToNode(schema, checkpoint?.content);
  return getDocumentFromDocAndVersions(schemaVersion, checkpointDocument, versions);
};

// ================================================================================
// the maximum number of characters in a Notebook name
// TODO: make a configuration parameter
const MAX_NOTEBOOK_NAME_LENGTH = 1024/*SEE: Notebook*/;

// NOTE: If there is no a valid title on the Document from an Checkpoint it will
//       default to 1) the first 'n' characters of the content or 2) DEFAULT_NOTEBOOK_NAME
export const extractDocumentName = (schemaVersion: NotebookSchemaVersion, notebookId: NotebookIdentifier, document: DocumentNodeType) => {
  switch(schemaVersion) {
    case NotebookSchemaVersion.V1: throw createApplicationError('devel/unhandled', `Notebook (${notebookId}) schema version '${NotebookSchemaVersion.V1}' is no longer supported.`);
    case NotebookSchemaVersion.V2:
      return extractDocumentNameV2(document);

    default: return assertNever(schemaVersion);
  }
};

const extractDocumentNameV2 = (document: DocumentNodeType) => {
  // if there is a Title Node then retrieve its content otherwise take the
  // first 'n' chars of the content

  // TODO: implement!!!
  //const titleNode = document.firstChild;
  //if(titleNode?.type.name !== TITLE_NODE_NAME) { logger.error(`Invalid first child for (${DOC_NAME}) in Notebook (${version}; ${notebookId}). Expected (${TITLE_NODE_NAME}) but got (${titleNode?.type.name})`); return DEFAULT_NOTEBOOK_NAME/*nothing to do*/; }
  //const textNode = titleNode.firstChild;
  //if(textNode?.type.name !== TEXT_NAME) { logger.error(`Invalid first child for (${TITLE_NODE_NAME}) in Notebook (${version}; ${notebookId}). Expected (${TEXT_NAME}) but got (${textNode?.type.name})`); return DEFAULT_NOTEBOOK_NAME/*nothing to do*/; }
  //const name = textNode.text?.trim();
  //return name || DEFAULT_NOTEBOOK_NAME;

  // TODO: needs to be more complex to handle cases such as leading blanks, etc.
  const node = document.firstChild;
  if(!node) return DEFAULT_NOTEBOOK_NAME;
  return node.textContent.trim().substring(0, MAX_NOTEBOOK_NAME_LENGTH);
};
