import { ChakraProvider } from '@chakra-ui/react';
import type { AppProps } from 'next/app';
import Head from 'next/head';

import { AuthUserProvider } from 'authUser/context/AuthUserProvider';
import ErrorBoundary from 'core/component/ErrorBoundary';
import { theme } from 'core/theme';
import { getPageWrapper, WrappedPage } from 'core/wrapper';
import { FullPageLayout } from 'shared/layout/FullPageLayout';

import '../index.css';

// Next.JS 'App' special component.
// Initializes all Pages within the Application
// REF: https://nextjs.org/docs/advanced-features/custom-app
// ********************************************************************************
interface Props extends AppProps { Component: WrappedPage; }
// == Client Side =================================================================
// FIXME: why is this not an arrow function like every other React component?
function App({ Component, pageProps }: Props) {
  const wrappers = Component.wrappers ?? [/*none*/];

  return (
    <>
      <Head>
        <title>Ureeka | Notebook</title>
        <meta property="og:title" content="Ureeka | Notebook" key="title" />
      </Head>
      <ChakraProvider theme={theme}>
        <ErrorBoundary>
          <FullPageLayout>
            <AuthUserProvider>
              {getPageWrapper(wrappers, <Component {...pageProps} />)}
            </AuthUserProvider>
          </FullPageLayout>
        </ErrorBoundary>
      </ChakraProvider>
    </>
  );
}

// --------------------------------------------------------------------------------
// Export without a wrapper since its the root page
export default App;
