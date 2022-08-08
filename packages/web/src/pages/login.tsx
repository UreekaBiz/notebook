import { Avatar, Box, Flex, Heading, Stack } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

import { SignInWithGoogleButton } from 'authUser/component/SignInWithGoogleButton';
import { useIsAuth } from 'authUser/hook/useIsAuth';
import { useIsAuthServiceInitialized } from 'authUser/hook/useIsAuthServiceInitialized';
import { WrappedPage } from 'core/wrapper';
import { coreRoutes } from 'shared/routes';

// A page that let Users authenticate. An already-auth'ed User is redirected to
// coreRoutes.root if accessed.
// SEE: AuthUserProvider
// ********************************************************************************
// NOTE: this page is using Static Site Generation. See pages/README.md
// == Client Side =================================================================
function LoginPage() {
  const isAuthServiceInitialized = useIsAuthServiceInitialized();
  const isAuth = useIsAuth();
  const router = useRouter();

  // -- Effect --------------------------------------------------------------------
  // client-side redirect when User is auth'ed (so User doesn't see Login)
  useEffect(() => {
    if(!isAuth || !isAuthServiceInitialized) return/*User will see page*/;
    router.push(coreRoutes.notebook);
  }, [isAuth, isAuthServiceInitialized, router]);

  // -- UI ------------------------------------------------------------------------
  return (
    <Flex alignItems='center' flexDirection='column' justifyContent='center' width='full' height='full' backgroundColor='gray.200' >
      <Stack flexDir='column' justifyContent='center' alignItems='center' marginBottom={2}>
        <Avatar bg='gray.500' />
        <Heading color='gray.500'>Welcome</Heading>
        <Box minWidth={{ base: '90%', md: '468px' }}>
          <form>
            <Stack spacing={4} padding='1rem' backgroundColor='gray.600' borderRadius={15} boxShadow='md'>
              <SignInWithGoogleButton />
            </Stack>
          </form>
        </Box>
      </Stack>
    </Flex>
  );
}

// --------------------------------------------------------------------------------
// SEE: core/wrapper.tsx for more information
const Page: WrappedPage = LoginPage;
      Page.wrappers = [/*no wrappers*/];

export default Page;
