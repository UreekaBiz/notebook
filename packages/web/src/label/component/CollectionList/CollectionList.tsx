import { Box, Button, Divider, Flex, IconButton, Select, StackDivider, Text, VStack } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { useState, useEffect, ChangeEventHandler } from 'react';
import { HiSortAscending, HiSortDescending } from 'react-icons/hi';

import { getLogger, isBlank, isOrderByDirection, LabelService, LabelTuple, LabelVisibility, Logger, OrderByDirection, Scrollable } from '@ureeka-notebook/web-service';

import { useUserId } from 'authUser/hook/useUserId';
import { Loading } from 'shared/component/Loading';
import { useAsyncStatus, useIsMounted } from 'shared/hook';

import { CollectionListItem } from './CollectionListItem';

const log = getLogger(Logger.DEFAULT);

// ********************************************************************************
// == Component ===================================================================
export const CollectionList = () => {
  const userId = useUserId();
  const isMounted = useIsMounted();
  const [status, setStatus] = useAsyncStatus();

  const router = useRouter(),
        { query } = router;

  // get the values for the filter
  // NOTE: Default values are given when the value is not valid, this could be the
  //       case when a User modifies the values directly from the url.
  const visibilityFilter = query.visibility === LabelVisibility.Private ? LabelVisibility.Private
                         : query.visibility === LabelVisibility.Public ? LabelVisibility.Public
                         : undefined/*default*/;
  const sortDirection = (isOrderByDirection(query.sortDirection) ? query.sortDirection : 'asc'/*default*/) as OrderByDirection/*by definition*/;

  // == State =====================================================================
  const [labelTuples, setLabelTuples] = useState<LabelTuple[]>([/*initially empty*/]);

  const [scrollable, setScrollable] = useState<Scrollable<LabelTuple>>();

  // == Effect ====================================================================
  useEffect(() => {
    if(!userId) return/*nothing to do*/;

    setLabelTuples([]/*clear values*/);
    setStatus('loading');
    const scrollableLabels = LabelService.getInstance().onLabels({ visibility: visibilityFilter, createdBy: userId, sort: [{ field: 'name', direction: sortDirection }] }, 5/*FIXME: temporary for testing*/);
    setScrollable(scrollableLabels);

    const subscription = scrollableLabels.documents$().subscribe({
      next: value => {
        if(!isMounted()) return/*component is unmounted, prevent unwanted state updates*/;
        setLabelTuples(value);
        setStatus('complete');
      },
      error: (error) => {
        log.info(`Unexpected error getting Labels. Error: `, error);
        if(!isMounted()) return/*component is unmounted, prevent unwanted state updates*/;

        setStatus('error');
      },
    });

    return () => subscription.unsubscribe();
  }, [setStatus, visibilityFilter, sortDirection, isMounted, userId]);

  // == Handler ===================================================================
  // -- Published ----------------------------------------------------------------
  const handleVisibilityChange: ChangeEventHandler<HTMLSelectElement> = (event) => {
    const { value } = event.target;
    const query: Record<string, string> = { ...router.query, visibility: value };

    if(isBlank(value)/*no value*/) delete query.visibility;/*remove query parameter*/

    router.replace({ query });
  };

  // -- Sort ----------------------------------------------------------------------
  const handleSortDirectionClick = () => {
    // toggles direction
    router.replace({
      query: { ...router.query, sortDirection: sortDirection === 'asc' ? 'desc' : 'asc' },
   });
  };

  // ------------------------------------------------------------------------------
  const handleMoreClick = () => {
    if(!scrollable || scrollable.isExhausted()) return/*nothing to do*/;

    scrollable.moreDocuments();
  };

  // == UI ========================================================================
  let content: React.ReactElement;
  if(status === 'error') {
    content = (
      <Flex align='center' justify='center' width='full' height='full' paddingTop='60px'>
        <Text>An error ocurred getting Collections.</Text>
      </Flex>
    );
  } else if(status !== 'complete' || !scrollable){
    content = <Loading />;
  } else if(labelTuples.length < 1) {
    // TODO: add a CTA to create a Collection
    content = (
      <Flex align='center' justify='center' width='full' height='full' paddingTop='60px'>
        <Text>No Collections were found.</Text>
      </Flex>
    );
  } else {
    content = (
      <VStack
        divider={<StackDivider borderColor='gray.200' />}
        spacing={2}
        align='stretch'
      >
        {labelTuples.map((labelTuple) =>
          <CollectionListItem key={labelTuple.id} labelTuple={labelTuple} />
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
          <Text marginRight={2}>Visibility</Text>
          <Select value={query.visibility} size='xs' width={120} marginRight={2} onChange={handleVisibilityChange}>
            <option value=''/*empty value*/>All</option>
            <option value={LabelVisibility.Public}>Public</option>
            <option value={LabelVisibility.Private}>Private</option>
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
