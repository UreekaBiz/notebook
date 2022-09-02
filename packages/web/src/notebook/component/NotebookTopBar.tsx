import { Flex, Text } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { useCallback } from 'react';
import { BsBook } from 'react-icons/bs';

import { AuthAvatar } from 'authUser/component/AuthAvatar';
import { coreRoutes } from 'shared/routes';
import { NewNotebookButton } from './NewNotebookButton';


// @see: notebookEditor/toolbar/component/SidebarTopbar
// header for Notebook-based pages that is *ONLY* used in Auth'd cases
// ********************************************************************************
interface Props { background?: string; }
export const NotebookTopBar: React.FC<Props> = ({ background }) => {
  const router = useRouter();

  const handleAppNameClick = useCallback(() => {
    router.push(coreRoutes.root);
  }, [router]);

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
        <NewNotebookButton marginRight={2}/>
        <AuthAvatar />
      </Flex>
    </Flex>
  );
};
