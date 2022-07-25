import { useEffect } from 'react';

import { getLogger, signOut, Logger } from '@ureeka-notebook/web-service';

import { useRouter } from 'next/router';
import { LoadingPage } from 'shared/pages/LoadingPage';
import { WrappedPage } from 'core/wrapper';
import { RequiredAuthUserWrapper } from 'authUser/RequiredAuthUserWrapper';

const log = getLogger(Logger.AUTH_USER);

// Page to logout the User. This should not render any meaningful content since
// its only job is to logout the User. After the User is logged out, they are
// redirected to #coreRoutes.root.
// ********************************************************************************
// NOTE: this page is using Static Site Generator. See pages/README.md
// == Client Side =================================================================
function LogoutPage () {
  const router = useRouter();

  // -- Effects -------------------------------------------------------------------
  // sign out the auth'ed User
  useEffect(() => {
    // User will be auth'ed by the time this page is rendered due to
    // RequiredAuthUserWrapper.
    signOut();
log.info('Logging out user.');
    // User will be redirected to #coreRoutes.login by RequiredAuthUserWrapper when
    // the user is not auth'ed anymore.
  }, [router]);

  // -- UI ------------------------------------------------------------------------
  return <LoadingPage />;
}

// --------------------------------------------------------------------------------
// SEE: core/wrapper.tsx for more information
const Page: WrappedPage = LogoutPage;
      Page.wrappers = [RequiredAuthUserWrapper]/*outer to inner order*/;

export default Page;
