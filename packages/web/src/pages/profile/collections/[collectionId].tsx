import { Box, Button, Flex, Heading, Text, useToast } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { BiPencil } from 'react-icons/bi';

import { getLogger, Label, LabelIdentifier, LabelService, Logger, ObjectTuple } from '@ureeka-notebook/web-service';

import { RequiredAuthUserWrapper } from 'authUser/RequiredAuthUserWrapper';
import { WrappedPage } from 'core/wrapper';
import { CollectionNotebookList } from 'label/component/CollectionNotebookList';
import { LabelServiceWrapper } from 'label/LabelServiceWrapper';
import { NotebookServiceWrapper } from 'notebook/NotebookServiceWrapper';
import { Loading } from 'shared/component/Loading';
import { useAsyncStatus, useIsMounted } from 'shared/hook';
import { ProfileNavigationLayout } from 'shared/layout/ProfileNavigationLayout';
import { UserProfileServiceWrapper } from 'user/UserProfileServiceWrapper';
import { CollectionDialog } from 'label/component/CollectionDialog';

// FIXME: Use label logger?
const log = getLogger(Logger.NOTEBOOK);

// ********************************************************************************
// NOTE: this page is using Static Site Generation. See pages/README.md
// == Client Side =================================================================
function CollectionIdPage() {
  // get the notebookId from the URL
  // NOTE: the effect(s) below handle if the notebookId is not found
  const router = useRouter();
  const { collectionId } = router.query as { collectionId: LabelIdentifier; }/*FIXME: follow a paradigm like in [publishedNotebookId].tsx*/;

  const isMounted = useIsMounted();
  const toast = useToast();

  // == State =====================================================================
  const [label, setLabel] = useState<ObjectTuple<string, Label | null>>();
  const [status, setStatus] = useAsyncStatus();

  // == Effect ====================================================================
  useEffect(() => {
    if(!collectionId) return/*nothing to do*/;

    setStatus('loading');
    setLabel(undefined/*clear values*/);

    const label = LabelService.getInstance().onLabel$(collectionId).subscribe({
      next: value => {
        if(!isMounted()) return/*component is unmounted, prevent unwanted state updates*/;
        setLabel(value);
        setStatus('complete');
      },
      error: (error) => {
        log.info(`Unexpected error getting Label ${collectionId}. Error: `, error);
        if(!isMounted()) return/*component is unmounted, prevent unwanted state updates*/;

        toast({ title: 'Error', description: 'Unexpected error getting collection.', status: 'error' });
        setStatus('error');
      },
    });

    return () => { label.unsubscribe(); };
    // NOTE: UseEffect only depends on the collectionId. If more deps are required,
    //       then add it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collectionId]);

  // == UI ========================================================================
  if(status === 'idle' || status === 'loading') return <Loading />;
  // else -- has loaded

  if(status === 'error') {
    return (
      <Flex alignItems='center' justifyContent='space-between' width='full' marginBottom={4}>
        <Heading flex='1 1'>Collection</Heading>
        <Flex align='center' justify='center' width='full' height='full' paddingTop='60px'>
          <Text>An error ocurred getting Collection</Text>
        </Flex>
      </Flex>
    );
  } /* else -- is not an error */

  if(!label || !label.obj) {
    return (
      <Flex alignItems='center' justifyContent='space-between' width='full' marginBottom={4}>
        <Heading flex='1 1'>Collection not found</Heading>
      </Flex>
    );
  } /* else -- collection was found */

  return (
    <Box>
      <Flex alignItems='center' justifyContent='space-between' width='full' marginBottom={4}>
        <Heading
          flex='1 1'

          // Clamp to 2 lines
          overflow='hidden'
          display='-webkit-box'
          style={{
            lineClamp: 2,
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {label.obj.name}
        </Heading>
        <CollectionDialog labelId={label.id} label={label.obj} type='edit' component={(onClick) => (
          <Button
            size='md'
            variant='ghost'
            colorScheme='gray'
            onClick={onClick}
            leftIcon={<BiPencil size={18} />}
          >
            Edit
          </Button>
        )}
        />
      </Flex>
      <CollectionNotebookList labelId={collectionId} />
    </Box>
  );
}

// --------------------------------------------------------------------------------
// SEE: core/wrapper.tsx for more information
const Page: WrappedPage = CollectionIdPage;
      Page.wrappers = [RequiredAuthUserWrapper, UserProfileServiceWrapper, NotebookServiceWrapper, LabelServiceWrapper, ProfileNavigationLayout]/*outer to inner order*/;

export default Page;
