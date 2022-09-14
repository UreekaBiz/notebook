import { Button, Flex, Menu, MenuButton, MenuList } from '@chakra-ui/react';
import { IoIosArrowDown } from 'react-icons/io';

import { NotebookIdentifier } from '@ureeka-notebook/web-service';

import { NewNotebookButton } from 'notebook/component/NewNotebookButton';
import { NotebookListItemCopy } from 'notebook/component/NotebookList/NotebookListItemMenu/NotebookListItemCopy';

// ********************************************************************************
interface Props {
  notebookId: NotebookIdentifier;
}
export const SidebarTopbarButton: React.FC<Props> = ({ notebookId, ...props }) => {
  return (
    <Flex alignItems='center'>
      <NewNotebookButton size='xs' borderRadius='4px'/>
      <Menu size='xs'>
        <MenuButton
          as={Button}
          size='xs'
          aria-label='Options'
          variant='ghost'
          borderRadius='4px'
          color='#333'
        >
          <IoIosArrowDown />
        </MenuButton>
        <MenuList>
          <NotebookListItemCopy notebookId={notebookId}/>
        </MenuList>
      </Menu>
    </Flex>
  );
};
