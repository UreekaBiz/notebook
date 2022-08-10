import { NotebookVersion } from './type';
import { contentToStep } from './version';
import { DocumentNodeType } from './proseMirror/extension/document';
import { nodeToContent } from './proseMirror/node';
import { NotebookSchemaVersion } from './proseMirror/schema';

// ********************************************************************************
export const getContentFromDocAndVersions = (schemaVersion: NotebookSchemaVersion, doc: DocumentNodeType, versions: NotebookVersion[]) => {
  versions.forEach(version => {
    const prosemirrorStep = contentToStep(schemaVersion, version.content);

    // ProseMirror takes a ProsemirrorStep and applies it to the Document as the
    // last Step generating a new Document
    // NOTE: this process can result in failure for multiple reasons such as the
    //       Schema is invalid or the Step tried collide with another Step and the
    //       result is invalid.
    // NOTE: if the process fails then that failed Step can be safely ignored since
    //       the ClientDocument will ignore it as well
    const stepResult = prosemirrorStep.apply(doc);
    if(stepResult.failed || !stepResult.doc) { console.error(`Invalid Notebook (${schemaVersion}) Version (${version.index}) '${version.content}' when combining Document and new Versions. Ignoring. Reason: `, stepResult.failed); return/*ignore Version / Step*/; }
    doc = stepResult.doc;
  });

  return nodeToContent(doc);
};
