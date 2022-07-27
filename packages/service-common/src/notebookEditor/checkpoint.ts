import { EditorState } from 'prosemirror-state';

import { NotebookDocumentContent } from './proseMirror/document';
import { NotebookSchemaVersion } from './proseMirror/schema';
import { contentToNode, nodeToContent } from './proseMirror/node';
import { getSchema } from './proseMirror/schema';
import { Checkpoint, NotebookVersion } from './type';
import { contentToStep } from './version';

// ********************************************************************************
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
  versions.forEach(version => {
    const prosemirrorStep = contentToStep(schema, version.content);

    // ProseMirror takes a ProsemirrorStep and applies it to the Document as the
    // last Step generating a new Document
    // NOTE: this process can result in failure for multiple reasons such as the
    //       Schema is invalid or the Step tried collide with another Step and the
    //       result is invalid.
    // NOTE: if the process fails then that failed Step can be safely ignored since
    //       the ClientDocument will ignore it as well
    // FIXME: is below an 'error' or 'warning'? The comments above seem to indicate
    //        that it's a warning.
    const stepResult = prosemirrorStep.apply(doc);
    if(stepResult.failed || !stepResult.doc) { console.error(`Invalid Notebook (${schemaVersion}) Version (${version.index}) '${version.content}'. Reason: ${stepResult.failed}. Ignoring.`); return/*ignore Version / Step*/; }

    doc = stepResult.doc;
  });

  return nodeToContent(doc);
};
