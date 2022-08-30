import { Box, Button, Divider, Flex, StackDivider, Text, VStack } from '@chakra-ui/react';
import { useState, useEffect } from 'react';

import { getLogger, Logger, NotebookService, NotebookSortField, NotebookTuple, Scrollable } from '@ureeka-notebook/web-service';

import { useUserId } from 'authUser/hook/useUserId';
import { Loading } from 'shared/component/Loading';
import { useAsyncStatus, useIsMounted } from 'shared/hook';

import { NotebookListItem } from './NotebookListItem';

const log = getLogger(Logger.DEFAULT);

// ********************************************************************************
export const NotebookList = () => {
  // == State =====================================================================
  const [notebookTuples, setNotebookTuples] = useState<NotebookTuple[]>([/*initially empty*/]);

  const [scrollable, setScrollable] = useState<Scrollable<NotebookTuple>>();

  const [sortBy, setSortBy] = useState<NotebookSortField>('name'/*initially name*/);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc'/*initially asc*/);


  const isMounted = useIsMounted();
  const [status, setStatus] = useAsyncStatus();
  const userId = useUserId();

  // == Effect ====================================================================
  useEffect(() => {
    if(!userId) return/*nothing to do*/;
    setNotebookTuples([]/*clear values*/);

    const notebookService = NotebookService.getInstance();

    setStatus('loading');
    const scrollableNotebooks = notebookService.onNotebooks({ editableBy: userId, sort: [{ field: sortBy, direction: sortDirection }] }, 5);
    setScrollable(scrollableNotebooks);

    const subscription = scrollableNotebooks.documents$().subscribe({
      next: value => {
        if(!isMounted()) return/*component is unmounted, prevent unwanted state updates*/;
        setNotebookTuples(value);
        setStatus('complete');
      },
      error: (error) => {
        log.info(`Unexpected error getting Notebooks. Error: `, error);
        if(!isMounted()) return/*component is unmounted, prevent unwanted state updates*/;

        setStatus('error');
      },
    });

    return () => subscription.unsubscribe();
  }, [setStatus, sortBy, sortDirection, isMounted, userId]);

  // == Handler ===================================================================
  const handleMoreClick = () => {
    if(!scrollable || scrollable.isExhausted()) return/*nothing to do*/;

    scrollable.moreDocuments();
  };

  // == UI ========================================================================
  if(status === 'error') {
    return (
      <Flex align='center' justify='center' width='full' height='full'>
        <Text>An error ocurred getting Notebooks.</Text>
      </Flex>
    );
  } /* else -- request haven't failed*/

  if(status !== 'complete') return <Loading />;

  // TODO: add a CTA to create a Notebook
  if(notebookTuples.length < 1) {
    return (
      <Flex align='center' justify='center' width='full' height='full'>
        <Text>No Notebooks were found.</Text>
      </Flex>
    );
  } /* else -- Notebooks were found */

  return (
    <Box>
      <Flex alignItems='center' justifyContent='space-between'>
        <Box paddingY={1}>
          <Box>
            Published:
          </Box>
        </Box>
        <Box>
          <Box>
            Published:
          </Box>
        </Box>
        <Button onClick={handleMoreClick}>{scrollable?.isExhausted() ? 'Exhausted' : 'More!'} </Button>
      </Flex>
      <Divider borderColor='gray.200' marginBottom={2}/>
      <VStack
        divider={<StackDivider borderColor='gray.200' />}
        spacing={2}
        align='stretch'
      >
        {notebookTuples.map((notebookTuple) =>
          <NotebookListItem key={notebookTuple.id} notebookTuple={notebookTuple} />
        )}
      </VStack>
    </Box>
  );
};
