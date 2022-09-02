import { Button, Flex, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Text } from '@chakra-ui/react';

// ********************************************************************************
interface Props {
  title?: string;
  message?: string;

  confirmText?: string;
  cancelText?: string;

  isOpen: boolean;

  /** whether the modal should exists in the DOM even if it's closed */
  keepMounted?: boolean;

  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmationModal: React.FC<Props> = ({
  title = 'Are you sure?',
  message = 'This action cannot be undone',
  cancelText = 'Cancel',
  confirmText = 'Confirm',
  isOpen,
  keepMounted = false,
  onCancel, onConfirm,
}) => {

  return (
    <Modal isOpen={keepMounted || isOpen} closeOnEsc closeOnOverlayClick onClose={onCancel}>
      {isOpen && (
        <>
          <ModalOverlay />

          <ModalContent >
            <ModalHeader>
              <Flex alignItems='center'>
                <Text marginLeft={2}>{title}</Text>
              </Flex>
            </ModalHeader>

            <ModalCloseButton />

            <ModalBody>
              <Text>{message}</Text>
            </ModalBody>

            <ModalFooter>
              <Button variant='ghost' marginRight={2} onClick={onCancel}>{cancelText}</Button>
              <Button colorScheme='blue' autoFocus onClick={onConfirm}>{confirmText}</Button>
            </ModalFooter>
          </ModalContent>
        </>
      )}
    </Modal>
  );
};
