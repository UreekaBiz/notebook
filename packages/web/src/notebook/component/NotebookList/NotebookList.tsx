import { Box, Button, Divider, Flex, IconButton, Select, StackDivider, Text, VStack } from '@chakra-ui/react';
import { useState, useEffect, ChangeEventHandler } from 'react';
import { HiSortAscending, HiSortDescending } from 'react-icons/hi';

import { getLogger, Logger, NotebookService, NotebookSortField, NotebookTuple, Scrollable } from '@ureeka-notebook/web-service';

import { useUserId } from 'authUser/hook/useUserId';
import { NotebookAccessField, ReadableNotebookAccessField, ReadableNotebookSortField } from 'notebook/type';
import { Loading } from 'shared/component/Loading';
import { useAsyncStatus, useIsMounted } from 'shared/hook';

import { NotebookListItem } from './NotebookListItem';

const log = getLogger(Logger.DEFAULT);

// ********************************************************************************
// == Constants ===================================================================
const accessFields = Object.entries(ReadableNotebookAccessField).map(([key, value]) => ({ label: value, value: key as NotebookAccessField }));
const sortFields = Object.entries(ReadableNotebookSortField).map(([key, value]) => ({ label: value, value: key as NotebookSortField }));

// == Component ===================================================================
export const NotebookList = () => {
  const isMounted = useIsMounted();
  const [status, setStatus] = useAsyncStatus();
  const userId = useUserId();

  // == State =====================================================================
  const [notebookTuples, setNotebookTuples] = useState<NotebookTuple[]>([/*initially empty*/]);

  const [scrollable, setScrollable] = useState<Scrollable<NotebookTuple>>();

  const [accessField, setAccessField] = useState<NotebookAccessField>('viewableBy'/*initially*/);

  const [sortByField, setSortBy] = useState<NotebookSortField>('name'/*initially name*/);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc'/*initially asc*/);

  // == Effect ====================================================================
  useEffect(() => {
    if(!userId) return/*nothing to do*/;
    setNotebookTuples([]/*clear values*/);

    const notebookService = NotebookService.getInstance();

    setStatus('loading');
    const scrollableNotebooks = notebookService.onNotebooks({ [accessField]: userId, sort: [{ field: sortByField, direction: sortDirection }] }, 5/*FIXME: temporary for testing*/);
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
  }, [accessField, setStatus, sortByField, sortDirection, isMounted, userId]);

  // == Handler ===================================================================
  // -- Access --------------------------------------------------------------------
  const handleAccessChange: ChangeEventHandler<HTMLSelectElement> = (event) => {
    const { value } = event.target;

    setAccessField(value as NotebookAccessField/*by definition*/);
  };

  // -- Sort ----------------------------------------------------------------------
  const handleSortDirectionClick = () => {
    // toggles direction
    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
  };

  const handleSortByChange: ChangeEventHandler<HTMLSelectElement> = (event) => {
    const { value } = event.target;
    setSortBy(value as NotebookSortField/*by definition*/);
  };

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

  if(status !== 'complete' || !scrollable) return <Loading />;

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
      <Flex
        alignItems='center'
        justifyContent='space-between'
        color='#999'
        fontSize='13px'
        fontWeight='500'
      >
        <Flex alignItems='center'>
          <Text marginRight={2}>Access</Text>
          <Select value={accessField} size='xs' marginRight={2} onChange={handleAccessChange}>
            {accessFields.map(({ label, value }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </Select>

          <Button
            size='xs'
            variant='ghost'
            onClick={handleMoreClick}
          >
            {scrollable.isExhausted() ? 'Exhausted' : 'More!'}
          </Button>
        </Flex>

        <Flex alignItems='center'>
          <Text marginRight={2}>Sort</Text>
          <Select value={sortByField} size='xs' marginRight={2} onChange={handleSortByChange}>
            {sortFields.map(({ label, value }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </Select>

          <IconButton
            aria-label='sort direction'
            icon={sortDirection === 'asc' ? <HiSortAscending /> : <HiSortDescending />}
            size='sm'
            borderRadius='full'
            variant='ghost'
            onClick={handleSortDirectionClick}
          />

        </Flex>
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
