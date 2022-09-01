import { Box, Divider, Flex, StackDivider, Text, VStack } from '@chakra-ui/react';
import { useState, useEffect } from 'react';

import { getLogger, LabelIdentifier, LabelService, Logger, NotebookTuple, Pagination } from '@ureeka-notebook/web-service';

import { useUserId } from 'authUser/hook/useUserId';
import { Loading } from 'shared/component/Loading';
import { useAsyncStatus, useIsMounted } from 'shared/hook';

import { CollectionNotebookListItem } from './CollectionNotebookListItem';
import { PaginationControls } from 'shared/component/PaginationControls';

const log = getLogger(Logger.DEFAULT);

// ********************************************************************************
// == Type ========================================================================
const PAGE_SIZE = 5/*FIXME: temporary for testing*/;
interface Props {
  labelId: LabelIdentifier;
}

// == Component ===================================================================
export const CollectionNotebookList: React.FC<Props> = ({ labelId }) => {
  const userId = useUserId();
  const isMounted = useIsMounted();
  const [status, setStatus] = useAsyncStatus();

  // == State =====================================================================
  const [notebookTuples, setNotebookTuples] = useState<NotebookTuple[]>([/*initially empty*/]);

  const [pagination, setPagination] = useState<Pagination<NotebookTuple>>();

  // == Effect ====================================================================
  useEffect(() => {
    if(!userId) return/*nothing to do*/;
    setNotebookTuples([]/*clear values*/);

    setStatus('loading');
    const pagination = LabelService.getInstance().onNotebooks(labelId, PAGE_SIZE);
    setPagination(pagination);

    const subscription = pagination.documents$().subscribe({
      next: value => {
        if(!isMounted()) return/*component is unmounted, prevent unwanted state updates*/;

        setNotebookTuples(value);
        setStatus('complete');
      },
      error: (error) => {
        log.info(`Unexpected error getting Notebooks for label ${labelId}. Error: `, error);
        if(!isMounted()) return/*component is unmounted, prevent unwanted state updates*/;

        setStatus('error');
      },
    });

    return () => subscription.unsubscribe();
  }, [labelId, setStatus, isMounted, userId]);

  // == Handler ===================================================================
  // -- Pagination ---------------------------------------------------------------
  const handlePrevious = () => {
    if(!pagination) return/*nothing to do*/;
    if(pagination.getPageNumber() <= 1) return/*no previous data*/;

    setStatus('loading');
    pagination.previous();
  };

  const handleNext = () => {
    if(!pagination) return/*nothing to do*/;
    if(pagination.isExhausted()) return/*no more data*/;

    setStatus('loading');
    pagination.next();
  };


  // == UI ========================================================================
  let content: React.ReactElement;
  if(status === 'error') {
    content = (
      <Flex align='center' justify='center' width='full' height='full' paddingTop='60px'>
        <Text>An error ocurred getting Notebooks.</Text>
      </Flex>
    );
  } else if(status !== 'complete' || !pagination){
    content = <Loading />;
  } else if(pagination.getPageNumber() <= 1 /*at first page*/ &&  notebookTuples.length < 1/*don't have data*/) {
    // TODO: add a CTA to create a Notebook
    content = (
      <Flex align='center' justify='center' width='full' height='full' paddingTop='60px'>
        <Text>No Notebooks were found.</Text>
      </Flex>
    );
  } else {
    const startIndex = (pagination.getPageNumber() - 1/*1-based*/) * pagination.getPageSize() + 1,
          endIndex = startIndex + notebookTuples.length - 1;

    const showingComponent = (
      <Box color='#AAA' fontSize={12} fontWeight='600'>
        { (pagination.getPageNumber() === 0) ? (<>
        <Text as='span' color='#666'>0</Text> Notebooks
        </>) : (startIndex === endIndex) ? (<>
        Showing <Text as='span' color='#666'>{startIndex}</Text> Notebook
        </>) : (<>
        Showing <Text as='span' color='#666'>{startIndex}-{endIndex}</Text> Notebooks
        </>) }
      </Box>
    );
    const paginationControls = (
      <PaginationControls
        hasPrev={pagination.getPageNumber() > 1/*is first page*/}
        hasNext={!pagination.isExhausted()/*is last page*/}
        onPrevious={handlePrevious}
        onNext={handleNext}
      />
    );

    content = (
      <Box>
        <Flex justifyContent='space-between' marginBottom={3}>
          {showingComponent}
          {paginationControls}
        </Flex>

        <VStack
          divider={<StackDivider borderColor='gray.200' />}
          spacing={2}
          align='stretch'
        >
          {notebookTuples.length < 1 ? (
            <Flex align='center' justify='center' width='full' height='full' paddingTop='60px'>
              <Text>No more Notebooks were found.</Text>
            </Flex>
          ) : (
            notebookTuples.map((notebookTuple) =>
              <CollectionNotebookListItem key={notebookTuple.id} notebookTuple={notebookTuple} />
            )
          )}
        </VStack>

        <Flex alignItems='center' justifyContent='center' flexDirection='column' marginTop={2}>
          <Box marginBottom={2}>
            {showingComponent}
          </Box>
          <Box paddingY={1}>
            {paginationControls}
          </Box>
        </Flex>
      </Box>
    );
  }

  return (
    <Box>
      <Divider borderColor='gray.200' marginBottom={2}/>
      {content}
    </Box>
  );
};
