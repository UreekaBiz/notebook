import { Flex, Text, VStack } from '@chakra-ui/react';
import { useState, useEffect } from 'react';

import { getLogger, Logger, NotebookService, NotebookPublishedTuple } from '@ureeka-notebook/web-service';

import { Loading } from 'shared/component/Loading';
import { useAsyncStatus, useIsMounted } from 'shared/hook';

import { PublishedNotebookListItem } from './PublishedNotebookListItem';

const log = getLogger(Logger.DEFAULT);

// ********************************************************************************
export const PublishedNotebookList = () => {
  // == State =====================================================================
  const [notebookPublishedTuples, setNotebookPublishedTuples] = useState<NotebookPublishedTuple[]>([/*initially empty*/]);
  const [status, setStatus] = useAsyncStatus();

  // ------------------------------------------------------------------------------
  const isMounted = useIsMounted();

  // == Effect ====================================================================
  useEffect(() => {
    const notebookService = NotebookService.getInstance();

    setStatus('loading');
    const scrollablePublishedNotebooks = notebookService.onPublishedNotebooks({ sort: [{ field: 'createTimestamp', direction: 'desc' }] });
    const subscription = scrollablePublishedNotebooks.documents$().subscribe({
      next: value => {
        if(!isMounted()) return/*component is unmounted, prevent unwanted state updates*/;
        setNotebookPublishedTuples(value);
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
  if(notebookPublishedTuples.length < 1) {
    return (
      <Flex align='center' justify='center' width='full' height='full'>
        <Text>Create a Notebook!</Text>
      </Flex>
    );
  } /* else -- Published Notebook were found */

  return (
    <VStack spacing={10} alignItems='flex-start'>
      {notebookPublishedTuples.map(tuple => (
        <PublishedNotebookListItem key={tuple.id} notebookPublishedTuple={tuple} />
      ))}
    </VStack>
  );
};
