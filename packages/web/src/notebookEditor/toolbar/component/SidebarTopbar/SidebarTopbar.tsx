import { Box, Flex, Text } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useState } from 'react';
import { BsBook } from 'react-icons/bs';
import { MdLoop } from 'react-icons/md';

import { debounce, getLogger, Logger } from '@ureeka-notebook/web-service';

import { AuthAvatar } from 'authUser/component/AuthAvatar';
import { useNotebookEditor } from 'notebookEditor/hook/useNotebookEditor';
import { useIsMounted } from 'shared/hook';
import { coreRoutes } from 'shared/routes';
import { SidebarTopbarButton } from './SidebarTopbarButton';

const log = getLogger(Logger.NOTEBOOK);

// @see: notebook/component/NotebookTopbar.tsx
// header for NotebookEditor Sidebar  pages that is *ONLY* used in Auth'd cases.
// NOTE: The difference between this and the NotebookTopBar is that this is used in
//       context of an NotebookEditor and such has a different UI and states.
// ********************************************************************************
interface Props { background?: string; }
export const SidebarTopbar: React.FC<Props> = ({ background }) => {
  const { editorService, notebookId } = useNotebookEditor();

  const router = useRouter();
  const isMounted = useIsMounted();

  // == State =====================================================================
  const [hasPendingWrite, setHasPendingWrite] = useState(false/*default not writing*/);

  // == Effect ====================================================================
  // ------------------------------------------------------------------------------
  // 'Saving' state
  useEffect(() => {
    // debounce setting setHasPendingWrite to true to avoid flashing the text onn
    // each save.
    const debounced = debounce((value: boolean) => {
      // prevent updating state in unmounted component
      if(!isMounted()) return/*nothing to do*/;
      setHasPendingWrite(value);
    }, 1000/*T&E*/);

    const subscription = editorService.onPendingWrites$().subscribe({
      next: (hasPendingWrite) => {
        // cancel previous call to setHasPendingWrite if it's still pending
        debounced(hasPendingWrite);

        // immediately set setHasPendingWrite to false if there are no pending writes
        if(!hasPendingWrite) setHasPendingWrite(false);
      },
      error: (error) => {
        log.info(`Unexpected error listening Notebook Editor pending writes. Reason: `, error);
      },
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [editorService, isMounted]);

  // ------------------------------------------------------------------------------
  // currently Collaborating Users
  useEffect(() => {
    const subscription = editorService.onUsers$().subscribe({
      next: (collaboratingUsers) => {
        // FIXME: do something useful!!! (Some work will need to be done since the
        //        data is at the User-Session level (in case the same User is in the
        //        document more than once). The visual can be just a list of avatars.
        //        When one of the avatars is clicked the *latest* session navigated to.)
        console.log('collaboratingUsers: ', collaboratingUsers);
      },
      error: (error) => {
        log.info(`Unexpected error listening Notebook Editor Collaborating Users. Reason: `, error);
      },
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [editorService, isMounted]);

  // == Handler ===================================================================
  const handleAppNameClick = useCallback(() => {
    router.push(coreRoutes.root);
  }, [router]);

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
        <Box marginRight={2}>
          <SidebarTopbarButton notebookId={notebookId} />
        </Box>
        <AuthAvatar />
      </Flex>
    </Flex>
  );
};
