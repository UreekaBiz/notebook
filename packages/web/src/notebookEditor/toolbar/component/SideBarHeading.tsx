import { Avatar, Button, ButtonProps, Flex, Menu, MenuButton, MenuItem, MenuList, Spinner, Text } from '@chakra-ui/react';
import { useMemo } from 'react';
import { BiLogOut } from 'react-icons/bi';
import { BsBook } from 'react-icons/bs';
import { RiFileAddLine } from 'react-icons/ri';

// ********************************************************************************
interface Props {
  background?: string;
}
export const SideBarHeading: React.FC<Props> = ({ background }) => {
  // == State =====================================================================
  const isLoading = false/*Temporary placeholder*/;

  // == Handlers ==================================================================
  const handleGoToNotebookPage = () => {/*currently nothing*/};
  const handleCreateNewNotebook = () => {/*currently nothing*/};
  const handleLogOut = () => {/*currently nothing*/};

  // == UI ========================================================================
  const buttonProps: Partial<ButtonProps> = useMemo(() => (
    isLoading
      ? { disabled: true, leftIcon: <Spinner size='sm' /> }
      : { leftIcon: <RiFileAddLine size={16} />, onClick: handleCreateNewNotebook }
  ), [isLoading]);

  return useMemo(() => (
    <Flex align='center' justify='space-between' width='100%' paddingX={5} paddingY={2} background={background} borderBottom='1px solid' borderColor='gray.200'>
      <Flex align='center' _hover={{ cursor: 'pointer' }} onClick={handleGoToNotebookPage}>
        <BsBook size={20} />
        <Text fontSize={20} ml={2}>Notebook</Text>
      </Flex>
      <Flex align='center'>
        <Button variant='ghost' size='sm' {...buttonProps} colorScheme='gray'>{isLoading ? 'Creating...' : 'New'}</Button>
        <Menu>
          <MenuButton
            as={Avatar}
            src=''/*currently nothing*/
            size='sm'
            ml={4}
            _hover={{ cursor: 'pointer' }}
          />
          <MenuList>
            <MenuItem icon={<BiLogOut />} onClick={handleLogOut}>
              Sign out
            </MenuItem>
          </MenuList>
        </Menu>
      </Flex>
    </Flex>
  ), [background, buttonProps, isLoading]);
};
