import { useToast, Box, Button, Flex, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Select, Text } from '@chakra-ui/react';
import { useState } from 'react';
import { FiUsers } from 'react-icons/fi';

import { getLogger, isBlank, AuthUserService, APIKey, Logger } from '@ureeka-notebook/web-service';

import { useAuthedUser } from 'authUser/hook/useAuthedUser';
import { getReadableAPIKey } from 'authUser/type';
import { Loading } from 'shared/component/Loading';
import { useAsyncStatus, useIsMounted } from 'shared/hook';

const log = getLogger(Logger.AUTH_USER);

// ********************************************************************************
type ButtonProps = Readonly<{
  onClick: () => void;
}>;

interface Props {
  /** Custom button element that will be the trigger for the modal. */
  button: (buttonProps: ButtonProps) => React.ReactElement;
}
export const APIKeyDialog: React.FC<Props> = ({ button }) => {
  const authState = useAuthedUser();

  // == State =====================================================================
  const [apiKeyValue, setApiKeyValue] = useState<string>(''/*initially none*/);
  const [apiKeyType, setApiKeyType] = useState<APIKey | undefined/*no value selected*/>(undefined/*initially none*/);
  const [status, setStatus] = useAsyncStatus();

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false/*by contract*/);
  // AreYourSure state
  const [isAYSOpen, setIsAYSOpen] = useState(false/*by contract*/);

  const toast = useToast();
  const isMounted = useIsMounted();

  // Array of API Keys that can be used to create a new API Key. If the User is not
  // auth'ed a null value will be used as a sentinel value
  // FIXME: re-work above this such that there is a 'Auth'ed' state. This would
  //        actually be an error if the User was not auth'ed at this point!!!
  const notSetApiKeys = !authState ? null/*User not auth'ed*/
                                   : Object.values(APIKey)
                                          .filter((apiKey) => !authState.profilePrivate.apiKeys || authState.profilePrivate.apiKeys[apiKey] === undefined);

  // ..............................................................................
  const isDirty = !isBlank(apiKeyValue) || apiKeyType !== undefined;
  const isValid = !isBlank(apiKeyValue) && apiKeyType !== undefined;

  // == Handlers ==================================================================
  const resetState = () => {
    // Reset initial value
    setApiKeyValue(''/*initial value*/);
    setApiKeyType(undefined/*initial value*/);
    setStatus('idle');
  };

  // -- Modal handlers ------------------------------------------------------------
  const handleOpen = () => setIsModalOpen(true);
  const handleClose = () => {
    // Prevent modal from being closed while loading
    if(status === 'loading') return/*nothing to do*/;
    if(isDirty) { setIsAYSOpen(true); return/*nothing else to do*/; }

    resetState();
    setIsModalOpen(false);
  };

  // -- AreYouSure handlers -------------------------------------------------------
  const handleAYSClose = () => setIsAYSOpen(false);
  const handleAYSConfirmation = () => {
    resetState();
    setIsAYSOpen(false);
    setIsModalOpen(false);
  };

  // -- API Key handlers  ---------------------------------------------------------
  const handleInputChange: React.ChangeEventHandler<HTMLInputElement> = (event) => setApiKeyValue(event.target.value);
  const handleAPIKeySelect: React.ChangeEventHandler<HTMLSelectElement> = (event) => setApiKeyType(event.target.value as APIKey);

  const handleSave = async () => {
    if(!authState) { log.error('Calling handleSave on CreateAPIKeyDialog without authState. Stop execution.'); return/*nothing to do*/; }
    if(!apiKeyType || isBlank(apiKeyValue)) return /*nothing to do*/;
    if(status === 'loading') return/*nothing to do*/;

    // Prevent from setting an already existing API Key
    if(authState.profilePrivate.apiKeys && authState.profilePrivate.apiKeys[apiKeyType] !== undefined) {
      log.warn(`User (${authState.authedUser.userId}) is trying to create an API key (${apiKeyType}) that already exists. Stop execution.`);
      toast({ title: 'Error', description: 'This API key already exists.', status: 'error' });
      return/*nothing else to do*/;
    } /* else -- API Key is not set yet */

    try {
      const currentApiKeys = authState.profilePrivate.apiKeys ?? {}/*use empty object if not defined*/;
      const newApiKeys: Partial<Record<APIKey, string>> = { ...currentApiKeys, [apiKeyType]: apiKeyValue };
      setStatus('loading');
      await AuthUserService.getInstance().updateProfile({ apiKeys: newApiKeys });

      toast({ title: 'API Keys updates', status: 'success' });

      if(!isMounted()) return/*nothing to do*/;
      resetState();
      setIsModalOpen(false);
    } catch(error) {
      log.error(`Error updating API Keys for User (${authState.authedUser.userId}): `, error);

      toast({
        title: 'Unexpected error updating API Keys',
        description: /*show message only if present in error*/error instanceof Error ? error.message : undefined,
        status: 'error',
      });

      if(!isMounted()) return/*nothing else to do*/;
      setStatus('error');
    }
  };

  // == UI ========================================================================
  return (
    <>
      {button({ onClick: handleOpen })}
      <Modal isOpen closeOnEsc closeOnOverlayClick size='3xl' onClose={handleClose} >
        {isModalOpen && (
        <>
          <ModalOverlay />

          <ModalContent >
            <ModalHeader>
              <Flex alignItems='center'>
                <FiUsers size={18} />
                <Text marginLeft={2}>API Key</Text>
              </Flex>
            </ModalHeader>

            <ModalCloseButton />

            <ModalBody paddingX={0} paddingBottom={4} background='#FAFAFA' borderY='1px solid #F0F0F0'>
            {notSetApiKeys === null/*still loading*/ ? (
              <Loading />
            ) : (
              <>
                <Text fontSize={16} fontWeight={600} marginBottom={3} paddingX={6}>Add API Key</Text>
                <Flex alignItems='center' justifyContent='space-between' width='100%' marginBottom={4} paddingX={6}>
                  <Box flex='1 1' minWidth={0} marginRight={2}>
                    <Input disabled={status === 'loading'} onChange={handleInputChange}/>
                  </Box>
                  <Select disabled={status === 'loading'} width={250} value={apiKeyType ?? ''/*no selected value*/} onChange={handleAPIKeySelect}>
                    {/* empty value that serves as a placeholder */}
                    <option value='' disabled>Type</option>
                    {notSetApiKeys.map(apiKey => (
                      <option key={apiKey} value={apiKey}>{getReadableAPIKey(apiKey)}</option>
                    ))}
                  </Select>
                </Flex>
              </>
            )}
            </ModalBody>

            <ModalFooter>
              {isDirty ? (
                <>
                  <Button disabled={status === 'loading'} variant='ghost' marginRight={2} onClick={handleClose}>
                    Cancel
                  </Button>
                  {status === 'loading' ? (
                    <Button disabled colorScheme='blue'><Loading /></Button>
                  ):(
                    <Button disabled={!isValid} colorScheme='blue' onClick={handleSave}>Save</Button>
                  )}
                </>
              ):(
                <Button colorScheme='blue' onClick={handleClose}>Done</Button>
              )}
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
              <Text>Your are about to lose your changes.</Text>
            </ModalBody>

            <ModalFooter>
              <Button variant='ghost' marginRight={2} onClick={handleAYSClose}>Cancel</Button>
              <Button colorScheme='blue' onClick={handleAYSConfirmation}>Confirm</Button>
            </ModalFooter>
          </ModalContent>
        </>
        )}
      </Modal>
    </>
  );
};
