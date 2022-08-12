import { Button } from '@chakra-ui/react';
import { useState } from 'react';
import { RiFileAddLine } from 'react-icons/ri';

import { extractDocumentName, getLogger, Logger, NotebookService } from '@ureeka-notebook/web-service';

import { useNotebook } from 'notebook/hook/useNotebook';
import { EditorToolComponentProps } from 'notebookEditor/toolbar/type';
import { useNotebookEditor } from 'notebookEditor/hook/useNotebookEditor';

const log = getLogger(Logger.NOTEBOOK);

// ********************************************************************************
interface Props extends EditorToolComponentProps {/*no additional*/}
export const PublishNotebookButton: React.FC<Props> = () => {
  // FIXME: move to using correct Async states, toasts, etc.
  const { notebookId, editor, editorService } = useNotebookEditor();
  const { notebook } = useNotebook();

  // == States ====================================================================
  const [isLoading, setIsLoading] = useState(false/*by contract*/);

  // == Handler ===================================================================
  const handlePublishNotebook = async () => {
    if(!notebookId || !editorService) return/*nothing to do*/;
    setIsLoading(true);

    const versionIndex = editorService.getVersionIndex();
    const title = extractDocumentName(notebook.schemaVersion, notebookId, editor.state.doc)/*default to extracted Document name*/;
    const snippet = ''/*FIXME*/;
    const image = ''/*FIXME*/;
    try {
      await NotebookService.getInstance().publishNotebook({ notebookId, versionIndex, title, image, snippet });
    } catch(error) {
      log.error('Error creating published notebook: ', error);
      // FIXME: add toast!
    } finally {
      setIsLoading(false);
    }
  };

  // == UI ========================================================================
  return (
    <Button
      colorScheme='gray'
      variant='ghost'
      size='sm'
      leftIcon={<RiFileAddLine size={16} />}
      width={160}
      onClick={handlePublishNotebook}
    >
      {isLoading ? 'Publishing...' : (notebook.isPublished ? 'Republish Notebook' : 'Publish Notebook')}
    </Button>
  );
};
