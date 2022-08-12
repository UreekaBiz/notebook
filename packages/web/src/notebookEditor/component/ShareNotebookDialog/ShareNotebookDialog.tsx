import { useToast, Box, Button, Flex, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Text, VStack } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { FiUsers } from 'react-icons/fi';

import { getNotebookShareRoles, getLogger, mapEquals, userProfileComparator, Logger, NotebookService, ObjectTuple, ShareRole, UserIdentifier, UserProfilePublic, UserProfileService, MAX_NOTEBOOK_SHARE_USERS } from '@ureeka-notebook/web-service';

import { useAuthedUser } from 'authUser/hook/useAuthedUser';
import { useNotebook } from 'notebook/hook/useNotebook';
import { NotebookRoleSelector } from 'notebookEditor/component/NotebookRoleSelector';
import { Loading } from 'shared/component/Loading';
import { useAsyncStatus, useIsMounted } from 'shared/hook';
import { TypeaheadUserProfile } from 'user/component/TypeaheadUserProfile';
import { UserProfileListItem } from 'user/component/UserProfileListItem';

const log = getLogger(Logger.NOTEBOOK);

// ********************************************************************************
type UserRole = { role: ShareRole; userProfile: UserProfilePublic; };
export const ShareNotebookDialog: React.FC = () => {
  const authedUser = useAuthedUser();
  const { notebookId, notebook } = useNotebook();

  // == State =====================================================================
  // NOTE: shareRoles must have the User's profile in this map since it's
  //       needed to order the list of Users
  const [shareRoles, setShareRoles] = useState<Map<UserIdentifier, UserRole> | null/*not loaded yet*/>(null/*initially none*/);
  const [currentRole, setCurrentRole] = useState<ShareRole>(ShareRole.Viewer/*default role*/);
  const [status, setStatus] = useAsyncStatus();

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false/*by contract*/);
  // AreYourSure state
  const [isAYSOpen, setIsAYSOpen] = useState(false/*by contract*/);

  const toast = useToast();
  const isMounted = useIsMounted();

  // ..............................................................................
  // compares the initial value of the Roles from Notebook with the current state
  const isDirty = (shareRoles !== null)/*not dirty if not loaded yet */ &&
                  !mapEquals(getNotebookShareRoles(notebook), removeUserPublicProfilesFromMap(shareRoles));

  // current auth'ed User has the Creator Role
  const isCreator = authedUser?.authedUser.userId === notebook.createdBy;

  // == Effect ====================================================================
  // resolves (loads) the User Profile for the initial Roles
  useEffect(() => {
    if(!isModalOpen) return/*nothing to do*/;
    // can be re-run if any of the dependencies changes. A flag must be used to
    // indicate if this is the current effect in order to avoid race conditions
    let isCurrentEffect = true;
    const resolveUsersProfiles = async () => {
      // gets the Profile and store if in the map for each User
      const shareRolesWithUser = new Map<UserIdentifier, UserRole>();
      try {
        await Promise.all([...getNotebookShareRoles(notebook)].map(async ([userId, role]) => {
          try {
            const userProfile = await UserProfileService.getInstance().getUserProfile(userId);
            shareRolesWithUser.set(userId, { role, userProfile });
          } catch(error) {
            // if the Public Profile fails to load, the User will simply not be
            // shown in the list. This could be the case that the User no longer
            // exists but the ShareRoles still have a reference for it. In this
            // case when the Creator update the roles it will be removed and the
            // roles will be 'self-healing'
            // NOTE: log for server-side forensics
            log.warn(`Failed to get UserProfilePublic for User (${userId}). Reason: `, error);
          }
        }));
        if(!isMounted() || !isCurrentEffect) return/*nothing else to do*/;

        setShareRoles(shareRolesWithUser);
      } catch(error) {
        log.error(`Error fetching User Profiles in Notebook (${notebookId}) for in Share Dialog. Reason: `, error);
        if(!isMounted() || isCurrentEffect) return/*nothing else to do*/;
      }
    };

    resolveUsersProfiles();
    return () => { isCurrentEffect = false/*by definition*/; };
    // NOTE: only executed when component is mounted. If this is meant to be executed
    //       each time the Notebook gets updated update the dependency array below
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isModalOpen]);

  // == Handler ===================================================================
  const resetState = () => {
    // Reset initial value
    setShareRoles(null/*initial value*/);
    setCurrentRole(ShareRole.Viewer);
    setStatus('idle');
  };

  // -- Modal handlers ------------------------------------------------------------
  const handleOpen = () => setIsModalOpen(true);
  const handleClose = () => {
    // prevent modal from being closed while loading
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

  // -- Role handlers -------------------------------------------------------------
  // add new record of userId and current Role
  const handleUserProfileSelect = (userId: UserIdentifier, role: ShareRole, userProfile: UserProfilePublic) => {
    const newShareRoles = new Map(shareRoles);
    newShareRoles.set(userId, { role, userProfile });

    setShareRoles(newShareRoles);
  };
  const handleRemoveUserRole = (userId: UserIdentifier) => {
    const newShareRoles = new Map(shareRoles);
    newShareRoles.delete(userId);

    setShareRoles(newShareRoles);
  };

  const handleCurrentRoleChange = (role: ShareRole) => setCurrentRole(role);

  const handleSaveChanges = async () => {
    if(shareRoles === null) { log.error(`Execute handleSaveChanges in Notebook (${notebookId}) but Roles is null.`); return/*nothing to do*/; }
    if(status === 'loading') return/*nothing to do*/;

    try {
      setStatus('loading');
      await NotebookService.getInstance().shareNotebook({ notebookId, userRoles: removeUserPublicProfilesFromMap(shareRoles) });
      toast({ title: 'Share updated', status: 'success' });
      resetState();
      setIsModalOpen(false);
    } catch(error) {
      log.error(`Error updating permissions in Notebook (${notebookId}): `, error);
      if(!isMounted()) return/*nothing else to do*/;

      setStatus('error');
      toast({
        title: 'Unexpected error updating permissions',
        description: /*show message only if present in error*/error instanceof Error ? error.message : undefined,
        status: 'error',
      });
    }
  };

  // == UI ========================================================================
  // sort the list of User-Shares and hold a set of those Users (for quick exclusion)
  const roleToProfile = ([userId, { userProfile }]: [UserIdentifier, UserRole]): ObjectTuple<UserIdentifier, UserProfilePublic> => ({ id: userId, obj: userProfile });
  const sortedShareRoles = Array.from(shareRoles ?? []/*empty array if not loaded yet, loading status will be handled below by the UI*/)
                                .sort((a, b) => userProfileComparator(roleToProfile(a), roleToProfile(b)));
  const existingSharedUserIds = new Set<UserIdentifier>(sortedShareRoles.map(([userId]) => userId));

  return (
    <>
      <Button
        colorScheme='gray'
        variant='ghost'
        size='sm'
        leftIcon={<FiUsers size={16} />}
        onClick={handleOpen}
      >
        Share
      </Button>

      <Modal isOpen closeOnEsc closeOnOverlayClick size='xl' onClose={handleClose} >
        {isModalOpen && (
        <>
          <ModalOverlay />

          <ModalContent >
            <ModalHeader>
              <Flex alignItems='center'>
                <FiUsers size={18} />
                <Text marginLeft={2}>Share</Text>
              </Flex>
            </ModalHeader>

            <ModalCloseButton />

            <ModalBody paddingX={0} paddingBottom={4} background='#FAFAFA' borderY='1px solid #F0F0F0'>
              {shareRoles === null/*not loaded yet*/ ? <Loading /> : (
                <>
                  <Text fontSize={16} fontWeight={600} marginBottom={3} paddingX={6}>Add User</Text>
                  <Flex alignItems='center' justifyContent='space-between' width='100%' marginBottom={4} paddingX={6}>
                    <Box flex='1 1' minWidth={0} marginRight={2}>
                      <TypeaheadUserProfile
                        disabled={!isCreator || shareRoles.size >= MAX_NOTEBOOK_SHARE_USERS || status === 'loading'}
                        ignoreUserIds={existingSharedUserIds}
                        onSelect={userProfileTuple => handleUserProfileSelect(userProfileTuple.id, currentRole, userProfileTuple.obj)}
                      />
                    </Box>
                    <NotebookRoleSelector
                      disabled={!isCreator || shareRoles.size >= MAX_NOTEBOOK_SHARE_USERS || status === 'loading'}
                      value={currentRole}
                      onChange={handleCurrentRoleChange}
                    />
                  </Flex>

                  <Text fontSize={16} fontWeight={600} marginBottom={3} paddingX={6}>Users with access</Text>
                  <VStack spacing={4} align='flex-start' maxHeight={300} paddingX={6}  overflowY='auto'>
                    {sortedShareRoles.map(([userId, { role, userProfile }]) => (
                      <Flex key={userId} alignItems='center' justifyContent='space-between' width='100%'>
                        <Box flex='1 1' minWidth={0} marginRight={2}>
                          <UserProfileListItem userId={userId} />
                        </Box>
                        <NotebookRoleSelector
                          canRemove
                          disabled={!isCreator || status === 'loading'}
                          value={role}
                          onChange={(newRole) => handleUserProfileSelect(userId, newRole, userProfile)}
                          onRemove={() => handleRemoveUserRole(userId)}
                        />
                      </Flex>
                    ))}
                  </VStack>
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
                    <Button colorScheme='blue' onClick={handleSaveChanges}>Save</Button>
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
              <Text>Your are going to lose your changes.</Text>
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

// == Utility =====================================================================
// removes the User from the roles
// NOTE: This function lives here since it's only needed to map the shareRoles to
//       the service format. If it's needed elsewhere, move it to a separate file.
const removeUserPublicProfilesFromMap = (shareRoles: Map<UserIdentifier, UserRole>): Map<UserIdentifier, ShareRole> => {
  const mappedSharedRoles = new Map<UserIdentifier, ShareRole>();
  shareRoles.forEach(({ role }, userId) => mappedSharedRoles.set(userId, role));

  return mappedSharedRoles;
};
