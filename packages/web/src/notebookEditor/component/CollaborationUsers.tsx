import { Box, Flex } from '@chakra-ui/react';
import { useEffect, useState } from 'react';

import { getLogger, Logger, NotebookUsers, NotebookUserSession, UserIdentifier } from '@ureeka-notebook/web-service';

import { useValidatedAuthedUser } from 'authUser/hook/useValidatedAuthedUser';
import { useNotebookEditor } from 'notebookEditor/hook/useNotebookEditor';
import { useIsMounted } from 'shared/hook';
import { UserProfileAvatarLive } from 'user/component/UserProfileAvatarLive';

const log = getLogger(Logger.NOTEBOOK);
// *********************************************************************************
interface Props {/*currently nothing*/}
export const CollaborationUsers: React.FC<Props> = () => {
  const { authedUser: { userId: currentUserId } } = useValidatedAuthedUser();
  const { editorService, editor } = useNotebookEditor();

  const isMounted = useIsMounted();

  // == State =====================================================================
  const [collaboratingUsers, setCollaboratingUsers] = useState<NotebookUsers | null/*no value*/>(null/*initial value*/);

  // == Effect ====================================================================
  // ------------------------------------------------------------------------------
  // currently Collaborating Users
  useEffect(() => {
    const subscription = editorService.onUsers$().subscribe({
      next: (collaboratingUsers) => setCollaboratingUsers(collaboratingUsers),
      error: (error) => {
        log.info(`Unexpected error listening Notebook Editor Collaborating Users. Reason: `, error);
      },
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [editorService, isMounted]);

  // == Handler ===================================================================
  const handleUserClick = (userId: UserIdentifier) => {
    const sessions = collaboratingUsers?.[userId];
    if(!sessions) return/*invalid session -- nothing to do*/;

    // get the most recent session
    // NOTE: Due to the fact that a user can have multiple sessions in the case of
    //       multiple tabs/windows, we need to get the most recent session to navigate
    //       to the correct Node.
    let mostRecent: NotebookUserSession | undefined/*no value*/ = undefined;
    for(const sessionId in sessions) {
      const session = sessions[sessionId];
      if(!mostRecent) mostRecent = session;
      mostRecent = session.timestamp > mostRecent.timestamp ? session : mostRecent;
    }
    if(!mostRecent) return/*invalid session -- nothing to do*/;

    const { cursorPosition } = mostRecent;
    // update the focus
    // TODO: Use DocumentUpdates
    editor.chain()
          .setTextSelection(cursorPosition)
          .focus(cursorPosition)
          .run();
  };
  // == UI ========================================================================
  if(!collaboratingUsers) return null/*nothing to render*/;

  return (
    <Flex alignItems='center'>
      {Object.keys(collaboratingUsers).map((userId, index) => userId === currentUserId ? null/*don't display own user*/ : (
        <Box
          key={userId}
          width='34px'
          height='34px'
          marginRight={index < Object.keys(collaboratingUsers).length - 1 ? '-8px' : '0px'} // all but last avatar
          borderRadius='34px'
          border='2px solid #F3F3F3'
          _hover={{
            cursor: 'pointer',
          }}
        >
          <UserProfileAvatarLive
            userId={userId}
            width='32px'
            height='32px'
            showBorder
            onClick={() => handleUserClick(userId)}
          />
        </Box>
      ))}
    </Flex>
  );
};
