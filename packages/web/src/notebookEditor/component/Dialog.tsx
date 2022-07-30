import { Button, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay } from '@chakra-ui/react';
import { useState } from 'react';

// ********************************************************************************
interface DialogButton {
  text: string;
  onClick: (inputValue: string) => void;
  loading: boolean;
}
interface Props {
  dialogTitle: string;
  inputPlaceholder: string;
  buttons: DialogButton[];
  enterCallback: (inputValue: string) => Promise<void>;
  isOpen: boolean;
  onClose: () => void;
}
export const Dialog: React.FC<Props> = ({ dialogTitle, inputPlaceholder, enterCallback, buttons, isOpen, onClose }) => {
  // == State =====================================================================
  const [inputValue, setInputValue] = useState(''/*initially blank*/);

  // == Handler ===================================================================
  const handleClose = () => {
    setInputValue(''/*clear on close for sanity*/);
    onClose();
  };

  const handleKeyDown = async (event: React.KeyboardEvent<HTMLInputElement>) => {
    if(event.key !== 'Enter') return;
    /* else -- enter pressed */

    event.preventDefault();
    await enterCallback(inputValue);
    handleClose();
  };


  // == UI ========================================================================
  return (
    <Modal isOpen={isOpen} onClose={handleClose} onEsc={handleClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{dialogTitle}</ModalHeader>
        <ModalCloseButton onClick={handleClose} />
        <ModalBody>
          <Input
            size='sm'
            marginTop={1}
            value={inputValue}
            placeholder={inputPlaceholder}
            autoFocus={true}
            autoComplete='off'
            color='black'
            variant='unstyled'
            onChange={(event) => setInputValue(event.target.value)}
            onKeyDown={handleKeyDown}
          />
        </ModalBody>
        <ModalFooter>
          {buttons.map((button, buttonIndex) =>
            <Button
              key={buttonIndex}
              variant='ghost'
              colorScheme='blue'
              isLoading={button.loading}
              onClick={() => { setInputValue(''/*clear*/); button.onClick(inputValue); }}
            >
              {button.text}
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
