import { useToast, Button, Flex, Spinner, Text } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { useCallback, useState } from 'react';
import { BsBook } from 'react-icons/bs';
import { RiFileAddLine } from 'react-icons/ri';

import { getLogger, NotebookService, NotebookType, Logger } from '@ureeka-notebook/web-service';

import { AuthAvatar } from 'authUser/component/AuthAvatar';
import { useIsMounted } from 'shared/hook';
import { coreRoutes, notebookRoute } from 'shared/routes';

const log = getLogger(Logger.NOTEBOOK);

// ********************************************************************************
interface Props { background?: string; }
export const NotebookTopBar: React.FC<Props> = ({ background }) => {
  const router = useRouter();
  const isMounted = useIsMounted();
  const toast = useToast();

  // == State =====================================================================
  const [isLoading, setIsLoading] = useState<boolean>(false/*default not loading*/);

  // == Handlers ==================================================================
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

    // Open a new tab with the newly created Notebook
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
        <AuthAvatar avatarSize='sm' showLogIn={false}/>
      </Flex>
    </Flex>
  );
};
