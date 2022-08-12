import { useToast, Button, Flex, Spinner, Text } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useState } from 'react';
import { BsBook } from 'react-icons/bs';
import { RiFileAddLine } from 'react-icons/ri';

import { debounce, getLogger, NotebookService, NotebookType, Logger } from '@ureeka-notebook/web-service';

import { AuthAvatar } from 'authUser/component/AuthAvatar';
import { useNotebookEditor } from 'notebookEditor/hook/useNotebookEditor';
import { useIsMounted } from 'shared/hook';
import { coreRoutes, notebookRoute } from 'shared/routes';
import { MdLoop } from 'react-icons/md';

const log = getLogger(Logger.NOTEBOOK);

// @see: notebook/component/NotebookTopbar.tsx
// header for NotebookEditor Sidebar  pages that is *ONLY* used in Auth'd cases.
// NOTE: The difference between this and the NotebookTopBar is that this is used in
//       context of an NotebookEditor and such has a different UI and states.
// ********************************************************************************
interface Props { background?: string; }
export const SidebarTopbar: React.FC<Props> = ({ background }) => {
  const { editorService } = useNotebookEditor();

  const router = useRouter();
  const isMounted = useIsMounted();
  const toast = useToast();

  // == State =====================================================================
  const [isLoading, setIsLoading] = useState<boolean>(false/*default not loading*/);
  const [hasPendingWrite, setHasPendingWrite] = useState(false/*default not writing*/);

  // == Effect ====================================================================
  useEffect(() => {
    // debounce setting isLoading to true to avoid flashing the text in each save.
    const debounced = debounce((value: boolean) => setHasPendingWrite(value), 1000);

    const subscription = editorService.onPendingWrites$().subscribe({
      next: (hasPendingWrite) => {
        debounced(hasPendingWrite);

        // immediately set isLoading to false if there are no pending writes
        if(!hasPendingWrite) setHasPendingWrite(false);
      },
      error: (error) => {
        log.info(`Unexpected error listening Notebook Editor pending writes. Reason: `, error);
      },
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [editorService]);

  // == Handler ===================================================================
  const handleAppNameClick = useCallback(() => {
    router.push(coreRoutes.root);
  }, [router]);

  const handleCreateNotebook = useCallback(async () => {
    setIsLoading(true);

    let notebookId: string;
    try {
      notebookId = await NotebookService.getInstance().createNotebook({
        name: 'Untitled'/*default*/,
        type: NotebookType.Notebook/*default*/,
      });
    } catch(error) {
      log.error('Error creating Notebook, reason: ', error);
      if(isMounted()) toast({ title: 'Error creating Notebook', status: 'error' });

      return /*nothing else to do*/;
    }

    if(!isMounted()) return/*component is unmounted, prevent unwanted state updates*/;

    setIsLoading(false/*no longer loading*/);

    // open a new tab with the newly created Notebook
    const notebookPath = notebookRoute(notebookId);
    const route = `${window.location.origin}${notebookPath}`;
    window.open(route, '_blank'/*new tab*/);
  }, [isMounted, toast]);

  // == UI ========================================================================
  return (
    <Flex
      align='center'
      justify='space-between'
      width='100%'
      paddingY={2}
      paddingX={5}
      background={background}
      borderBottom='1px solid'
      borderColor='gray.200'
    >
      <Flex align='center' _hover={{ cursor: 'pointer' }} onClick={handleAppNameClick}>
        <BsBook size={20} />
        <Text marginLeft={2} fontSize={20}>Notebook</Text>
      </Flex>
      <Flex align='center'>
        {hasPendingWrite ? (
          <Flex
            alignItems='center'
            marginLeft={2}
            fontSize={12}
            lineHeight='25px'
            color='#555'
            fontWeight={600}
          >
            <MdLoop size={14}/>
            <Text marginLeft={1}>Saving...</Text>
          </Flex>
        ): null/*nothing*/}
        {isLoading ?
          (
            <Button disabled colorScheme='gray' variant='ghost' size='sm' leftIcon={<Spinner size='sm' />} >
              Creating...
            </Button>
          ) : (
            <Button colorScheme='gray' variant='ghost' size='sm' leftIcon={<RiFileAddLine size={16} />} onClick={handleCreateNotebook}>
              New
            </Button>
          )}
        <AuthAvatar avatarSize='sm' />
      </Flex>
    </Flex>
  );
};
