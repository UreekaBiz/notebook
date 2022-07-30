import { convertContentToHTML, NotebookDocumentContent } from '@ureeka-notebook/web-service';

// ********************************************************************************
interface Props {
  // The content of a Notebook stringified
  content: NotebookDocumentContent;
}
export const NotebookViewer: React.FC<Props>= ({ content }) => {
  // Use dangerouslySetInnerHTML to the corresponding HTML string of the Notebook.
  // This is a security risk, but it is the only way to render the content of a
  // Notebook at the moment.
  const htmlContent = convertContentToHTML(content);
  return (
    <div className='Editor'/*SEE: /index.css*/ dangerouslySetInnerHTML={{ __html: htmlContent ?? '' }} />
  );
};
