import { useToast, Flex, IconButton, Menu, MenuButton, MenuItem, MenuList, Spinner, MenuDivider } from '@chakra-ui/react';
import { useState } from 'react';
import { BsGrid, BsThreeDots } from 'react-icons/bs';
import { FiUsers } from 'react-icons/fi';
import { HiTrash } from 'react-icons/hi';
import { MdPublish } from 'react-icons/md';

import { getLogger, isNotebookCreator, Logger, NotebookService, NotebookTuple } from '@ureeka-notebook/web-service';

import { useAuthedUser } from 'authUser/hook/useAuthedUser';
import { AddToCollectionDialog } from 'label/component/AddToCollectionDialog';
import { ShareNotebookDialog } from 'notebookEditor/component/ShareNotebookDialog';
import { ConfirmationModal } from 'shared/component/ConfirmationModal';
import { useAsyncStatus, useIsMounted } from 'shared/hook';
import { NotebookListItemCopy } from './NotebookListItemCopy';

const log = getLogger(Logger.NOTEBOOK);

// ********************************************************************************
interface Props {
  notebookTuple: NotebookTuple;
}
export const NotebookListItemMenu: React.FC<Props> = ({ notebookTuple }) => {
  const authedUser = useAuthedUser();
  const { id, obj } = notebookTuple;

  const isCreator = authedUser && isNotebookCreator(authedUser.authedUser.userId, obj);

  const isMounted = useIsMounted();
  const toast = useToast();

  // == State =====================================================================
  const [isDeleteAYSOpen, setIsDeleteAYSOpen] = useState(false);
  const [status, setStatus] = useAsyncStatus();

  // == Handler ===================================================================
  // -- Publish -------------------------------------------------------------------
  const handlePublishClick = () => {/*not implemented*/};

  // -- Delete --------------------------------------------------------------------
  const handleDeleteClick = () => {
    setIsDeleteAYSOpen(true);
  };

  const handleDeleteCancel = () => {
    setIsDeleteAYSOpen(false);
  };

  const handleDeleteConfirm = async () => {
    setIsDeleteAYSOpen(false);
    if(status === 'loading') return/*nothing to do*/;

    setStatus('loading');
    try {
      await NotebookService.getInstance().deleteNotebook(id);
      if(!isMounted()) return/*nothing to do*/;

      toast({
        title: 'Notebook deleted',
        status: 'success',
      });

      // NOTE: No need to update the state since deleting the Notebook will
      //       automatically remove it from the list
    } catch(error){
      log.error(`Error deleting Notebook (${id}): `, error);
      if(!isMounted()) return/*nothing to do*/;

      toast({
        title: 'Failed to delete Notebook',
        description: /*show message only if present in error*/error instanceof Error ? error.message : undefined,
        status: 'error',
      });
      setStatus('error');
    }
  };

  // == UI ========================================================================
  if(status === 'loading'){
    return (
      <Flex width='32px'/*matches the Menu size*/ justifyContent='center'>
        <Spinner size='sm'/>
      </Flex>
    );
  }
  return (
    <>
      <Menu>
        <MenuButton
          as={IconButton}
          aria-label='Options'
          icon={<BsThreeDots />}
          variant='ghost'
          size='sm'
          borderRadius='100px'
          color='#999'
        />
        <MenuList>
          <MenuItem disabled icon={<MdPublish />} onClick={handlePublishClick}>
            Publish
          </MenuItem>
          <ShareNotebookDialog notebook={obj} notebookId={id} component={onClick => (
            <MenuItem disabled icon={<FiUsers />} onClick={onClick}>
              Share
            </MenuItem>
            )}
          />
          <NotebookListItemCopy  notebookId={id} />

          {isCreator && (
            <>
              <MenuDivider />
              <AddToCollectionDialog notebook={obj} notebookId={id} component={onClick => (
                <MenuItem disabled icon={<BsGrid />} onClick={onClick}>
                  Add to collection
                </MenuItem>
                )}
              />
            </>
          )}

          {isCreator && (
            <>
              <MenuDivider />
              <MenuItem disabled icon={<HiTrash />} onClick={handleDeleteClick}>
                Delete
              </MenuItem>
            </>
          )}
        </MenuList>
      </Menu>
      <ConfirmationModal
        isOpen={isDeleteAYSOpen}
        onCancel={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
};
