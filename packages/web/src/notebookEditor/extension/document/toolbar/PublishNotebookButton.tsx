import { Button } from '@chakra-ui/react';
import { useState } from 'react';
import { RiFileAddLine } from 'react-icons/ri';

import { getLogger, NotebookService, Logger } from '@ureeka-notebook/web-service';

import { EditorToolComponentProps } from 'notebookEditor/toolbar/type';
import { useNotebookEditor } from 'notebookEditor/hook/useNotebookEditor';
import { extractDocumentName } from '@ureeka-notebook/service-common';

const log = getLogger(Logger.NOTEBOOK);

// ********************************************************************************
interface Props extends EditorToolComponentProps {/*no additional*/}
export const PublishNotebookButton: React.FC<Props> = () => {
  // == States ====================================================================
  // FIXME: move to using correct Async states, toasts, etc.
  const { notebookId, editor, editorService } = useNotebookEditor();
  const [isLoading, setIsLoading] = useState(false/*by contract*/);

  // == Handlers ==================================================================
  const handlePublishNotebook = async () => {
    if(!notebookId || !editorService) return/*nothing to do*/;
    setIsLoading(true);

    const version = editorService.getVersionIndex();
    const title = extractDocumentName(editor.state.doc)/*default to extracted Document name*/;
    const snippet = ''/*FIXME*/;
    const image = ''/*FIXME*/;
    try {
      await NotebookService.getInstance().publishNotebook({ notebookId, version, title, image, snippet });
    } catch(error) {
      log.error('Error creating published notebook: ', error);
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
      {isLoading ? 'Publishing...' : 'Publish Notebook'}
    </Button>
  );
};
