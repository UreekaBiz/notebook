import { useToast, Button, Flex, IconButton, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Td, Text, Tr } from '@chakra-ui/react';
import { useState } from 'react';
import { HiTrash } from 'react-icons/hi';

import { getLogger, APIKey, Logger } from '@ureeka-notebook/web-service';

import { getReadableAPIKey } from 'authUser/type';
import { useAsyncStatus, useIsMounted } from 'shared/hook';
import { Loading } from 'shared/component/Loading';

const log = getLogger(Logger.AUTH_USER);

// ********************************************************************************
interface Props {
  apiKey: APIKey;
  value: string;

  /** called 'handler' instead of 'on' since it's not a real on-trigger function */
  handleRemove: (apiKey: APIKey) => Promise<void>;
}
export const APIKeyTableItem: React.FC<Props> = ({ apiKey, value, handleRemove }) => {
  // == State =====================================================================
  const [status, setStatus] = useAsyncStatus();
  // AreYourSure state
  const [isAYSOpen, setIsAYSOpen] = useState(false/*by contract*/);

  // ..............................................................................
  const toast = useToast();
  const isMounted = useIsMounted();

  // == Handler ===================================================================
  // -- API Key handlers  ---------------------------------------------------------
  // Opens the AYS modal. This will prompt the user to confirm the deletion of the
  // API key. The handleAYSConfirmation will delete the API key correspondingly.
  const onDeleteClick = () => setIsAYSOpen(true);

  // -- AreYouSure handlers -------------------------------------------------------
  const handleAYSClose = () => setIsAYSOpen(false);
  const handleAYSConfirmation = async () => {
    setIsAYSOpen(false);

    try {
      setStatus('loading');

      // Call parents function.
      // NOTE: Errors will be handled at this level since it's needed to display
      //       alerts and visual states accordingly.
      await handleRemove(apiKey);

      // NOTE: Toast message for success will be handled by the parent component
      //       since this component will be unmounted after the deletion. For the
      //       same reason, there is no need to set 'complete' state since it will
      //       stop existing after completion.
      toast({ title: 'Success', description: 'API Key removed.', status: 'success' });
    } catch(error) {
      log.error(`Error removing API key (${apiKey}). Reason: ${error}`);

      if(!isMounted()) return/*nothing to do*/;

      setStatus('error');
      toast({ title: 'Error', description: 'Unexpected error ocurred while removing API Key. Please try again later.', status: 'error' });
    }
  };

  // == UI ========================================================================
  return (
    <Tr>
      <Td>{getReadableAPIKey(apiKey)}</Td>
      <Td>{value}</Td>
      <Td width={50}>
        {status === 'loading' ? <Loading /> : (
          <IconButton
          icon={<HiTrash />}
          size='sm'
          variant='ghost'
          aria-label='delete'
          onClick={onDeleteClick}
          />
        )}
        <Modal isOpen closeOnEsc closeOnOverlayClick onClose={handleAYSClose}>
        {isAYSOpen && (
        <>
          <ModalOverlay />

          <ModalContent >
            <ModalHeader>
              <Flex alignItems='center'>
                <Text marginLeft={2}>Are you sure?</Text>
              </Flex>
            </ModalHeader>

            <ModalCloseButton />

            <ModalBody>
              <Text>This action cannot be undone.</Text>
            </ModalBody>

            <ModalFooter>
              <Button variant='ghost' marginRight={2} onClick={handleAYSClose}>Cancel</Button>
              <Button colorScheme='blue' onClick={handleAYSConfirmation}>Confirm</Button>
            </ModalFooter>
          </ModalContent>
        </>
        )}
        </Modal>
      </Td>

    </Tr>
  );
};
