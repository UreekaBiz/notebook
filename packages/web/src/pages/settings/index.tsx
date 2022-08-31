import { useToast, Box, Heading, Text } from '@chakra-ui/react';

import { getLogger, AuthUserService, Logger, UserProfilePrivate_Update } from '@ureeka-notebook/web-service';

import { useAuthedUser } from 'authUser/hook/useAuthedUser';
import { SettingsForm } from 'authUser/settings/SettingsForm';
import { SettingsLayoutWrapper } from 'authUser/settings/SettingsLayoutWrapper';
import { RequiredAuthUserWrapper } from 'authUser/RequiredAuthUserWrapper';
import { WrappedPage } from 'core/wrapper';
import { NotebookServiceWrapper } from 'notebook/NotebookServiceWrapper';
import { useAsyncStatus, useIsMounted } from 'shared/hook';
import { ProfileNavigationLayout } from 'shared/layout/ProfileNavigationLayout';
import { LoadingPage } from 'shared/pages/LoadingPage';
import { UserProfileServiceWrapper } from 'user/UserProfileServiceWrapper';

const log = getLogger(Logger.AUTH_USER);

// ********************************************************************************
// NOTE: this page is using Static Site Generation. See pages/README.md
// == Client Side =================================================================
function SettingsPage() {
  // == State =====================================================================
  const user = useAuthedUser();

  const toast = useToast();
  const isMounted = useIsMounted();
  const [status, setStatus] = useAsyncStatus();

  // Wait until the User is loaded
  if(!user) return <LoadingPage />;
  const { profilePrivate } = user;

  const initialValues: UserProfilePrivate_Update = {
    firstName: profilePrivate.firstName,
    lastName: profilePrivate.lastName,
    about: profilePrivate.about,
    profileImageUrl: profilePrivate.profileImageUrl,
    socialMedia_facebook: profilePrivate.socialMedia_facebook,
    socialMedia_instagram: profilePrivate.socialMedia_instagram,
    socialMedia_linkedin: profilePrivate.socialMedia_linkedin,
    socialMedia_tiktok: profilePrivate.socialMedia_tiktok,
    socialMedia_twitter: profilePrivate.socialMedia_twitter,
  };

  // == Handler ===================================================================
  const handleSubmit = async (update: UserProfilePrivate_Update) => {
    try {
      setStatus('loading');
      await AuthUserService.getInstance().updateProfile(update);
      if(!isMounted()) return/*nothing else to do*/;

      setStatus('complete');
      toast({ title: 'Profile updated', status: 'success' });
    } catch(error) {
      log.error(`Error updating profile for user (${user.authedUser.userId}): `, error);
      if(!isMounted()) return/*nothing else to do*/;

      setStatus('error');
      toast({
        title: 'Unexpected error updating profile',
        description: /*show message only if present in error*/error instanceof Error ? error.message : undefined,
        status: 'error',
      });
    }
  };

  // == UI ========================================================================
  return (
    <Box>
      <Text>Settings</Text>
      <Heading marginBottom={4}>General</Heading>
      <SettingsForm initialValues={initialValues} status={status} onSubmit={handleSubmit} />
    </Box>
  );
}

// --------------------------------------------------------------------------------
// SEE: core/wrapper.tsx for more information
const Page: WrappedPage = SettingsPage;
      Page.wrappers = [RequiredAuthUserWrapper, UserProfileServiceWrapper, NotebookServiceWrapper, ProfileNavigationLayout, SettingsLayoutWrapper]/*outer to inner order*/;

export default Page;
