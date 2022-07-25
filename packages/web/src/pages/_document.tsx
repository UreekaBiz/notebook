import { Html, Head, Main, NextScript } from 'next/document';

// Next.JS 'Document' special component.
// Overrides the default Document component from Next.js enabling the definition of
// custom links on the head while rendering on the server-side.
// REF: https://nextjs.org/docs/advanced-features/custom-document
// ********************************************************************************
// == Client Side =================================================================
function Document() {
  return (
    <Html>
      <Head>
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}

// --------------------------------------------------------------------------------
// Export without a wrapper since its the Document page.
export default Document;
