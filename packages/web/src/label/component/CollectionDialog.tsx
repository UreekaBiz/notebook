import { useToast, Box, Button, Checkbox, Flex, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Select, Spinner, Text, Textarea } from '@chakra-ui/react';
import { useState, ChangeEventHandler } from 'react';
import { BsGrid } from 'react-icons/bs';

import { getLogger, isBlank, LabelService, LabelVisibility, Logger } from '@ureeka-notebook/web-service';

import { getReadableLabelVisibility } from 'label/type';
import { useAsyncStatus, useIsMounted } from 'shared/hook';

// FIXME: Use Label logger?
const log = getLogger(Logger.NOTEBOOK);

// ********************************************************************************
// == Type ========================================================================
interface Props {
  /** component to be used to open the Dialog. This component received the onClick
   *  handler that should be passed as a prop to the actual component. If no
   *  component is provided a default button is used.*/
  component?: (onClick: () => void) => React.ReactElement;
}
// == Component ===================================================================
export const CollectionDialog: React.FC<Props> = ({ component }) => {
  const toast = useToast();
  const isMounted = useIsMounted();

  // == State =====================================================================
  const [name, setName] = useState(''/*initial value*/);
  const [visibility, setVisibility] = useState<LabelVisibility>(LabelVisibility.Private/*default by contract*/);
  const [description, setDescription] = useState(''/*initial value*/);
  const [isOrdered, setIsOrdered] = useState(true/*initial value*/);

  const [status, setStatus] = useAsyncStatus();

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false/*by contract*/);
  // AreYourSure state
  const [isAYSOpen, setIsAYSOpen] = useState(false/*by contract*/);

  // ..............................................................................
  const isDirty = !isBlank(name),
        isLoading = status === 'loading';

  // == Handler ===================================================================
  const resetState = () => {
    // Reset initial value
    setName(''/*initial value*/);
    setVisibility(LabelVisibility.Private/*default by contract*/);
    setDescription(''/*initial value*/);
    setIsOrdered(true/*initial value*/);
  };

  // -- Modal handlers ------------------------------------------------------------
  const handleOpen = () => setIsModalOpen(true);
  const handleClose = () => {
    // prevent modal from being closed while loading
    if(isLoading) return/*nothing to do*/;
    if(isDirty) { setIsAYSOpen(true); return/*nothing else to do*/; }

    resetState();
    setIsModalOpen(false);
  };

  // .. Input handlers ............................................................
  const handleTitleChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    setName(event.target.value);
  };

  const handleVisibilityChange: ChangeEventHandler<HTMLSelectElement> = (event) => {
    setVisibility(event.target.value as LabelVisibility/*by definition*/);
  };

  const handleDescriptionChange: ChangeEventHandler<HTMLTextAreaElement> = (event) => {
    setDescription(event.target.value);
  };

  const handleOrderedChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    setIsOrdered(event.target.checked);
  };

  // .. Create ....................................................................
  const handleSaveChanges = async () => {
    if(isBlank(name)) return/*nothing to do*/;
    if(isLoading) return/*nothing to do*/;

    setStatus('loading');
    try {
      await LabelService.getInstance().createLabel({
        name,
        visibility,
        ordered: isOrdered,
        // description will be ignored if empty
        description: isBlank(description) ? undefined : description,
      });
      if(!isMounted()) return/*component is not mounted*/;

      // reset status
      setStatus('complete');
      toast({ title: 'Collection created', status: 'success' });

      // close modal
      resetState();
      setIsModalOpen(false);
    } catch(error) {
      log.error('Error while creating Label', error);
      if(!isMounted()) return/*component is not mounted*/;

      setStatus('error');

      const message =  error instanceof Error ? error.message : `Unknown error.`;
      toast({ title: 'Error while creating Collection', description: message, status: 'error' });
    }
  };

  // -- AreYouSure handlers -------------------------------------------------------
  const handleAYSClose = () => setIsAYSOpen(false);
  const handleAYSConfirmation = () => {
    resetState();
    setIsAYSOpen(false);
    setIsModalOpen(false);
  };

  // == UI ========================================================================
  return (
    <>
      {/* use component if provided */}
      {component ? component(handleOpen) : (
        <Button
          colorScheme='gray'
          variant='ghost'
          size='sm'
          leftIcon={<BsGrid size={16} />}
          onClick={handleOpen}
        >
          Create Collection
        </Button>
      )}

      <Modal isOpen closeOnEsc closeOnOverlayClick size='xl' onClose={handleClose} >
        {isModalOpen && (
        <>
          <ModalOverlay />

          <ModalContent >
            <ModalHeader>
              <Flex alignItems='center'>
                <BsGrid size={18} />
                <Text marginLeft={2}>Create collection</Text>
              </Flex>
            </ModalHeader>

            <ModalCloseButton />

            <ModalBody paddingX={0} paddingBottom={4} background='#FAFAFA' borderY='1px solid #F0F0F0'>
              <Flex flexDirection='column' gap={4} paddingX={6}>
                <Flex alignItems='space-between' gap={2}>
                  <Box flex='1 1'>
                    <Text color='#888' fontSize={14} fontWeight={600}>Title</Text>
                    <Input
                      value={name}
                      disabled={isLoading}
                      size='sm'
                      background='#FFF'
                      placeholder='Title'
                      onChange={handleTitleChange}
                    />
                  </Box>

                  <Box flex='1 1'>
                    <Text color='#888' fontSize={14} fontWeight={600}>Visibility</Text>
                    <Select
                      value={visibility}
                      disabled={isLoading}
                      size='sm'
                      background='#FFF'
                      onChange={handleVisibilityChange}
                    >
                      {/* placeholder */}
                      <option value='' disabled>Select visibility</option>
                      {Object.values(LabelVisibility).map((visibility) => (
                        <option key={visibility} value={visibility}>{getReadableLabelVisibility(visibility)}</option>
                      ))}
                    </Select>
                  </Box>
                </Flex>

                <Box flex='1 1'>
                  <Text color='#888' fontSize={14} fontWeight={600}>Description</Text>
                  <Textarea
                    value={description}
                    disabled={isLoading}
                    size='sm'
                    height='60px'
                    minHeight='60px'
                    maxHeight='120px'
                    background='#FFF'
                    placeholder='Description'
                    onChange={handleDescriptionChange}
                  />
                </Box>

                <Box flex='1 1'>
                  <Checkbox isChecked={isOrdered} onChange={handleOrderedChange}>Ordered</Checkbox>
                </Box>

                <Text color='#AAA' lineHeight='13px' fontSize={13} fontWeight={500}>
                  Ordered collections allow you to configure the order in which notebooks are displayed to the readers.
                </Text>
              </Flex>

            </ModalBody>

            <ModalFooter>
              <Box width='full'>
                <Flex justifyContent='flex-end'>
                  {isDirty ? (
                    <>
                      <Button
                        key='cancel'
                        disabled={status === 'loading'}
                        variant='ghost'
                        size='sm'
                        marginRight={2}
                        onClick={handleClose}
                      >
                        Cancel
                      </Button>
                      {status === 'loading' ? (
                        <Button key='save' disabled colorScheme='blue' size='sm'><Spinner size='sm'/></Button>
                      ):(
                        <Button key='save' colorScheme='blue' size='sm' onClick={handleSaveChanges}>Save</Button>
                      )}
                    </>
                  ):(
                    <Button key='done' colorScheme='blue' size='sm' onClick={handleClose}>Done</Button>
                  )}
                </Flex>
              </Box>
            </ModalFooter>
          </ModalContent>
        </>
        )}
      </Modal>

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
              <Text>Your are going to lose your changes.</Text>
            </ModalBody>

            <ModalFooter>
              <Button variant='ghost' marginRight={2} onClick={handleAYSClose}>Cancel</Button>
              <Button colorScheme='blue' autoFocus onClick={handleAYSConfirmation}>Confirm</Button>
            </ModalFooter>
          </ModalContent>
        </>
        )}
      </Modal>
    </>
  );
};

