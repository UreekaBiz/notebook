import { useToast, Button, Spinner } from '@chakra-ui/react';
import { useCallback, useState } from 'react';
import { CgFileAdd } from 'react-icons/cg';

import { getLogger, Logger, NotebookIdentifier, NotebookService, NotebookType } from '@ureeka-notebook/web-service';

import { useIsMounted } from 'shared/hook';
import { notebookRoute } from 'shared/routes';

const log = getLogger(Logger.NOTEBOOK);

// ********************************************************************************
interface Props {
  notebookId: NotebookIdentifier;
}
export const SidebarTopbarButton: React.FC<Props> = ({ notebookId, ...props }) => {
  const isMounted = useIsMounted();
  const toast = useToast();

  // == State =====================================================================
  const [isLoading, setIsLoading] = useState<boolean>(false/*default not loading*/);

  // == Handler ===================================================================
  const handleCreateNotebook = useCallback(async () => {
    setIsLoading(true);

    let notebookId: string;
    try {
      notebookId = await NotebookService.getInstance().createNotebook({
        name: 'Untitled'/*default*/,
        type: NotebookType.Notebook/*default*/,
      });
    } catch(error) {
      log.error('Error creating Notebook, reason: ', error);
      if(isMounted()) toast({ title: 'Error creating Notebook', status: 'error' });

      return /*nothing else to do*/;
    }

    if(!isMounted()) return/*component is unmounted, prevent unwanted state updates*/;

    setIsLoading(false/*no longer loading*/);

    // open a new tab with the newly created Notebook
    const notebookPath = notebookRoute(notebookId);
    const route = `${window.location.origin}${notebookPath}`;
    window.open(route, '_blank'/*new tab*/);
  }, [isMounted, toast]);

  // == UI ========================================================================
  if(isLoading) return (
    <Button
      disabled
      colorScheme='gray'
      variant='ghost'
      size='sm'
      leftIcon={<Spinner size='sm' />}
      {...props}
    >
      Creating...
    </Button>
  );

  return (
    <Button
      colorScheme='gray'
      variant='ghost'
      size='sm'
      leftIcon={<CgFileAdd size={16} />}
      onClick={handleCreateNotebook}
      {...props}
    >
      New
    </Button>
  );
};
