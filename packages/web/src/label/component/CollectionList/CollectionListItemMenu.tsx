import { useToast, Flex, IconButton, Menu, MenuButton, MenuItem, MenuList, Spinner } from '@chakra-ui/react';
import { useState } from 'react';
import { BiPencil } from 'react-icons/bi';
import { BsThreeDots } from 'react-icons/bs';
import { HiTrash } from 'react-icons/hi';

import { getLogger, LabelService, LabelTuple, Logger } from '@ureeka-notebook/web-service';

import { ConfirmationModal } from 'shared/component/ConfirmationModal';
import { useAsyncStatus, useIsMounted } from 'shared/hook';

import { CollectionDialog } from '../CollectionDialog';

// CHECK: Label Logger?
const log = getLogger(Logger.NOTEBOOK);

// ********************************************************************************
interface Props {
  labelTuple: LabelTuple;
}
export const CollectionListItemMenu: React.FC<Props> = ({ labelTuple }) => {
  const { id, obj } = labelTuple;

  const isMounted = useIsMounted();
  const toast = useToast();

  // == State =====================================================================
  const [isDeleteAYSOpen, setIsDeleteAYSOpen] = useState(false);
  const [status, setStatus] = useAsyncStatus();

  // == Handler ===================================================================
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
      await LabelService.getInstance().deleteLabel(id);
      if(!isMounted()) return/*nothing to do*/;

      toast({
        title: 'Collection deleted',
        status: 'success',
      });

      // NOTE: No need to update the state since deleting the Collection will
      //       automatically remove it from the list
    } catch(error){
      log.error(`Error deleting Collection (${id}): `, error);
      if(!isMounted()) return/*nothing to do*/;

      toast({
        title: 'Failed to delete collection',
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
          <CollectionDialog type='edit' labelId={id} label={obj} component={(onClick) => (
            <MenuItem onClick={onClick} icon={<BiPencil />}>
              Edit
            </MenuItem>
            )}
          />

          <MenuItem disabled icon={<HiTrash />} onClick={handleDeleteClick}>
            Delete
          </MenuItem>
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
