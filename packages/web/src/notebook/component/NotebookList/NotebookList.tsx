import { Flex, Table, Tbody, Td, Text, Th, Thead, Tr } from '@chakra-ui/react';
import { useState, useEffect } from 'react';

import { getLogger, Logger, NotebookTuple, NotebookService, NotebookIdentifier } from '@ureeka-notebook/web-service';

import { useUserId } from 'authUser/hook/useUserId';
import { Loading } from 'shared/component/Loading';
import { useAsyncStatus, useIsMounted } from 'shared/hook';
import { notebookRoute } from 'shared/routes';

const log = getLogger(Logger.DEFAULT);

// ********************************************************************************
export const NotebookList = () => {
  // == State =====================================================================
  const [notebookTuples, setNotebookTuples] = useState<NotebookTuple[]>([/*initially empty*/]);

  const isMounted = useIsMounted();
  const [status, setStatus] = useAsyncStatus();
  const userId = useUserId();

  // == Effect ====================================================================
  useEffect(() => {
    if(!userId) return/*nothing to do*/;

    const notebookService = NotebookService.getInstance();

    setStatus('loading');
    // TODO: use the Scrollable to implement scroll-for-more behavior
    const scrollableNotebooks = notebookService.onNotebooks({ editableBy: userId, sort: [{ field: 'name', direction: 'asc' }] }, 100/*FIXME: see TODO!*/);
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
  }, [setStatus, isMounted, userId]);

  // == Handler ===================================================================
  const handleNotebookClick = (notebookId: NotebookIdentifier) => {
    const notebookPath = notebookRoute(notebookId);
    const route = `${window.location.origin}${notebookPath}`;

    window.open(route, '_blank'/*new tab*/);
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
    <Table variant='simple'>
      <Thead>
        <Tr>
          <Th width='80%'>Name</Th>
          <Th>Type</Th>
          <Th isNumeric>Creation Date</Th>
        </Tr>
      </Thead>
      <Tbody>
        {notebookTuples.map((notebookTuple) => (
          <Tr key={notebookTuple.id} _hover={{ cursor:'pointer', bg: 'gray.50' }} onClick={() => handleNotebookClick(notebookTuple.id)}>
            <Td>{notebookTuple.obj.name}</Td>
            <Td>{notebookTuple.obj.type}</Td>
            <Td isNumeric>{notebookTuple.obj.createTimestamp.toDate().toLocaleDateString()}</Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
};
