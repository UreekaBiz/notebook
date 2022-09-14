import { MenuItem, Spinner, useToast } from '@chakra-ui/react';
import { CgFile } from 'react-icons/cg';
import { MouseEventHandler } from 'react';

import { getLogger, Logger, NotebookIdentifier, NotebookService } from '@ureeka-notebook/web-service';

import { useAsyncStatus, useIsMounted } from 'shared/hook';
import { notebookRoute } from 'shared/routes';

const log = getLogger(Logger.NOTEBOOK);
// ********************************************************************************
interface Props {
  notebookId: NotebookIdentifier;
}
export const NotebookListItemCopy: React.FC<Props> = ({ notebookId }) => {
  const isMounted = useIsMounted();
  const toast = useToast();

  // == State =====================================================================
  const [status, setStatus] = useAsyncStatus();

  // == Handler ===================================================================
  // copy the Notebook and opens it in a new tab
  const handleCopyClick: MouseEventHandler<HTMLButtonElement> = async () => {
    if(status === 'loading') return/*nothing to do*/;

    setStatus('loading');
    try {
      const copiedNotebookId = await NotebookService.getInstance().copyNotebook({ notebookId });
      if(!isMounted()) return/*nothing to do*/;

      setStatus('complete');
      toast({
        title: 'Notebook copied',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      // open a new tab with the newly created Notebook
      const notebookPath = notebookRoute(copiedNotebookId);
      const route = `${window.location.origin}${notebookPath}`;
      window.open(route, '_blank'/*new tab*/);

    } catch(error) {
      log.error('Failed to copy notebook', error);
      if(!isMounted()) return/*nothing to do*/;

      setStatus('error');
      toast({
        title: 'Failed to copy notebook',
        description: /*show message only if present in error*/error instanceof Error ? error.message : undefined,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // == UI ========================================================================
  return (
    <MenuItem
      closeOnSelect={false}
      disabled={status === 'loading'}
      icon={status === 'loading' ? <Spinner size='xs'/> : <CgFile />}
      onClick={handleCopyClick}
    >
      Copy
    </MenuItem>
  );
};
