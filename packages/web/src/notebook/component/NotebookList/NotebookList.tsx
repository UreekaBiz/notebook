import { Box, Button, Divider, Flex, IconButton, Select, StackDivider, Text, VStack } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { useState, useEffect, ChangeEventHandler } from 'react';
import { HiSortAscending, HiSortDescending } from 'react-icons/hi';

import { getLogger, isBlank, isNotebookSortField, isOrderByDirection, Logger, NotebookService, NotebookSortField, NotebookTuple, OrderByDirection, Scrollable } from '@ureeka-notebook/web-service';

import { useUserId } from 'authUser/hook/useUserId';
import { isNotebookAccessField, NotebookAccessField, ReadableNotebookAccessField, ReadableNotebookSortField } from 'notebook/type';
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
  const userId = useUserId();
  const isMounted = useIsMounted();
  const [status, setStatus] = useAsyncStatus();

  const router = useRouter(),
        { query } = router;

  // get the values for the filter
  // NOTE: Default values are given when the value is not valid, this could be the
  //       case when a User modifies the values directly from the url.
  const accessField = (isNotebookAccessField(query.accessField) ? query.accessField : 'viewableBy'/*default*/) as NotebookAccessField/*by definition*/;
  const publishedFilter = query.published === 'true' ? true
                        : query.published === 'false' ? false
                        : undefined/*default*/;
  const sortByField = (isNotebookSortField(query.sortByField) ? query.sortByField : 'name'/*default*/) as NotebookSortField/*by definition*/;
  const sortDirection = (isOrderByDirection(query.sortDirection) ? query.sortDirection : 'asc'/*default*/) as OrderByDirection/*by definition*/;

  // == State =====================================================================
  const [notebookTuples, setNotebookTuples] = useState<NotebookTuple[]>([/*initially empty*/]);

  const [scrollable, setScrollable] = useState<Scrollable<NotebookTuple>>();

  // == Effect ====================================================================
  useEffect(() => {
    if(!userId) return/*nothing to do*/;
    setNotebookTuples([]/*clear values*/);

    const notebookService = NotebookService.getInstance();

    setStatus('loading');
    const scrollableNotebooks = notebookService.onNotebooks({ published: publishedFilter, [accessField]: userId, sort: [{ field: sortByField, direction: sortDirection }] }, 5/*FIXME: temporary for testing*/);
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
  }, [accessField, publishedFilter, setStatus, sortByField, sortDirection, isMounted, userId]);

  // == Handler ===================================================================
  // -- Access --------------------------------------------------------------------
  const handleAccessChange: ChangeEventHandler<HTMLSelectElement> = (event) => {
    const { value } = event.target;
    // NOTE: The access field 'createdBy' cannot be set if the 'Created By' sort is
    //       being used, in this case a different value for the sortByField is used.
    router.replace({
      query: {
        ...router.query,
        accessField: value,
        sortByField: value === 'createdBy' && sortByField === 'createdBy' ? 'name'/*use default instead*/ : sortByField/*use current value*/,
      },
    });
  };

  // -- Published ----------------------------------------------------------------
  const handlePublishedChange: ChangeEventHandler<HTMLSelectElement> = (event) => {
    const { value } = event.target;
    const query: Record<string, string> = { ...router.query, published: value };

    if(isBlank(value)/*no value*/) delete query.published;/*remove query parameter*/

    router.replace({
      query,
    });
  };

  // -- Sort ----------------------------------------------------------------------
  const handleSortDirectionClick = () => {
    // toggles direction
    router.replace({
      query: { ...router.query, sortDirection: sortDirection === 'asc' ? 'desc' : 'asc' },
   });
  };

  const handleSortByChange: ChangeEventHandler<HTMLSelectElement> = (event) => {
    const { value } = event.target;
    router.replace({
      query: { ...router.query, sortByField: value },
    });
  };

  const handleMoreClick = () => {
    if(!scrollable || scrollable.isExhausted()) return/*nothing to do*/;

    scrollable.moreDocuments();
  };

  // == UI ========================================================================
  let content: React.ReactElement;
  if(status === 'error') {
    content = (
      <Flex align='center' justify='center' width='full' height='full' paddingTop='60px'>
        <Text>An error ocurred getting Notebooks.</Text>
      </Flex>
    );
  } else if(status !== 'complete' || !scrollable){
    content = <Loading />;
  } else if(notebookTuples.length < 1) {
    // TODO: add a CTA to create a Notebook
    content = (
      <Flex align='center' justify='center' width='full' height='full' paddingTop='60px'>
        <Text>No Notebooks were found.</Text>
      </Flex>
    );
  } else {
    content = (
      <VStack
        divider={<StackDivider borderColor='gray.200' />}
        spacing={2}
        align='stretch'
      >
        {notebookTuples.map((notebookTuple) =>
          <NotebookListItem key={notebookTuple.id} notebookTuple={notebookTuple} />
        )}
      </VStack>
    );
  }

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

          <Text marginRight={2}>Published</Text>
          <Select value={query.published} size='xs' marginRight={2} onChange={handlePublishedChange}>
            <option value=''/*empty value*/>All</option>
            <option value='true'>Published</option>
            <option value='false'>Not Published</option>
          </Select>

          <Button
            size='xs'
            variant='ghost'
            onClick={handleMoreClick}
          >
            {scrollable?.isExhausted() ? 'Exhausted' : 'More!'}
          </Button>
        </Flex>

        <Flex alignItems='center'>
          <Text marginRight={2}>Sort</Text>
          <Select value={sortByField} size='xs' marginRight={2} onChange={handleSortByChange}>
            {sortFields.map(({ label, value }) => {
              // NOTE: The access field 'createdBy' cannot be set if the
              //       'Created By' sort is being used, in this case a different
              //       value for the sortByField is used.
              // CHECK: Is this the right solution? Having the option but disabled
              //        could be better.
              if(accessField === 'createdBy' && value === 'createdBy') return null/*skip*/;
              return <option key={value} value={value}>{label}</option>;
            })}
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

      {content}
    </Box>
  );
};
