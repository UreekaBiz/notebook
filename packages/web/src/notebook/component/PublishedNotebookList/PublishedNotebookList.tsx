import { Flex, Text, VStack } from '@chakra-ui/react';
import { useState, useEffect } from 'react';

import { getLogger, Logger, NotebookService, PublishedNotebookTuple } from '@ureeka-notebook/web-service';

import { Loading } from 'shared/component/Loading';
import { useAsyncStatus, useIsMounted } from 'shared/hook';

import { PublishedNotebookListItem } from './PublishedNotebookListItem';

const log = getLogger(Logger.DEFAULT);

// ********************************************************************************
export const PublishedNotebookList = () => {
  // == State =====================================================================
  const [publishedNotebookTuples, setPublishedNotebookTuples] = useState<PublishedNotebookTuple[]>([/*initially empty*/]);
  const [status, setStatus] = useAsyncStatus();

  // ------------------------------------------------------------------------------
  const isMounted = useIsMounted();

  // == Effects ===================================================================
  useEffect(() => {
    const notebookService = NotebookService.getInstance();

    setStatus('loading');
    const scrollablePublishedNotebooks = notebookService.onPublishedNotebooks({/*no filter*/});
    const subscription = scrollablePublishedNotebooks.documents$().subscribe({
      next: value => {
        if(!isMounted()) return/*component is unmounted, prevent unwanted state updates*/;
        setPublishedNotebookTuples(value);
        setStatus('complete');
      },
      error: (error) => {
        log.info(`Unexpected error getting Notebooks. Error: `, error);
        if(!isMounted()) return/*component is unmounted, prevent unwanted state updates*/;

        setStatus('error');
      },
    });

    return () => subscription.unsubscribe();
  }, [setStatus, isMounted]);

  // == UI ========================================================================
  // FIXME: this is a temporary solution to display the error state
  if(status === 'error') {
    return (
      <Flex align='center' justify='center' width='full' height='full'>
        <Text>An error ocurred getting Notebooks.</Text>
      </Flex>
    );
  } /* else -- request haven't failed*/

  if(status !== 'complete') return <Loading />;

  // NOTE: in a live production environment, this will never happen since operationally
  //       there will always be at least one Published Notebook
  if(publishedNotebookTuples.length < 1) {
    return (
      <Flex align='center' justify='center' width='full' height='full'>
        <Text>Create a Notebook!</Text>
      </Flex>
    );
  } /* else -- Published Notebook were found */

  return (
    <VStack spacing={10} alignItems='flex-start'>
      {publishedNotebookTuples.map(tuple => (
        <PublishedNotebookListItem key={tuple.id} publishedNotebookTuple={tuple} />
      ))}
    </VStack>
  );
};
