import { convertContentToHTML, NotebookDocumentContent } from '@ureeka-notebook/web-service';

import { EDITOR_CLASS_NAME, EDITOR_PREVIEW_CLASS_NAME } from 'core/theme';

// ********************************************************************************
// == Constant ====================================================================
export const NOTEBOOK_VIEWER_ID = 'notebookViewerId';

// == Interface ====================================================================
interface Props {
  content: NotebookDocumentContent;
}

// == Component ===================================================================
export const NotebookViewer: React.FC<Props>= ({ content }) => {
  // uses `dangerouslySetInnerHTML` to the corresponding HTML string of the Notebook.
  // This is a security risk, but it is the only way to render the content of a
  // Notebook at the moment.
  const htmlContent = convertContentToHTML(content);
  return (
    <div id={NOTEBOOK_VIEWER_ID} className={`${EDITOR_CLASS_NAME} ${EDITOR_PREVIEW_CLASS_NAME}`}/*SEE: /index.css*/ dangerouslySetInnerHTML={{ __html: htmlContent ?? '' }} />
  );
};
