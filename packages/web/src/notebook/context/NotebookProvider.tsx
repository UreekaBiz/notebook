import { useToast } from '@chakra-ui/react';
import { useEffect, useState, ReactNode } from 'react';

import { ApplicationError, getLogger, Notebook, NotebookIdentifier, NotebookService, Logger } from '@ureeka-notebook/web-service';

import { Loading } from 'shared/component/Loading';
import { useAsyncStatus, useIsMounted } from 'shared/hook';

import { NotebookContext } from './NotebookContext';

const log = getLogger(Logger.NOTEBOOK);

// ************************************************************************************
interface Props {
  notebookId: NotebookIdentifier;
  children: ReactNode;
}
export const NotebookProvider: React.FC<Props> = ({ notebookId, children }) => {
  // == State =====================================================================
  const [notebook, setNotebook] = useState<Notebook | null>(null/*not loaded yet*/);
  const [status, setStatus] = useAsyncStatus();

  const isMounted = useIsMounted();
  const toast = useToast();

  // == Effects ===================================================================
  // subscribes to the Notebook with the give notebookId
  useEffect(() => {
    if(!notebookId) return/*nothing to do*/;

    setStatus('loading');
    const subscription = NotebookService.getInstance().onNotebook$(notebookId).subscribe({
      next: (notebook) => {
        log.info(`Load notebook: ${JSON.stringify(notebook)}`);
        if(!isMounted()) return/*component is unmounted, prevent unwanted state updates*/;

        setNotebook(notebook.obj);
        setStatus('complete');
        if(!notebook.obj) {
          log.info(`Notebook (${notebookId}) returned null.`);
          toast({ title: 'This Notebook does not exist', status: 'warning' });
          return/*nothing left to do*/;
        } /* else -- Notebook exists */
      },
      error: (error) => {
        if(!(error instanceof ApplicationError)) { log.error(`Unexpected error getting Notebook (${notebookId}). Reason: `, error); }
        else log.info(`Error getting Notebook (${notebookId}). Error: `, error);

        if(!isMounted()) return/*component is unmounted, prevent unwanted state updates*/;

        setStatus('error');
        toast({ title: `Unexpected error ocurred getting Notebook ${notebookId}`, status: 'warning' });
      },
    });

    return () => subscription.unsubscribe();
  }, [isMounted, notebookId, toast, setStatus]);

  // -- UI ------------------------------------------------------------------------
  if(status === 'loading' || status === 'idle') return <Loading />;

  return <NotebookContext.Provider value={{ notebook, notebookId, status }}>{children}</NotebookContext.Provider>;
};
