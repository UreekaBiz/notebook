import { GetServerSideProps } from 'next';

// Next.JS 'Error' special component.
// Overrides the default Error component from Next.js. This page is used when there
// is an error on the server side.
// ********************************************************************************

interface ServerSideProps { statusCode: number; }

// == Server Side =================================================================
export const getServerSideProps: GetServerSideProps<ServerSideProps> = async ({ res }) => {
  const statusCode = res ? res.statusCode : 404;
  return { props: { statusCode } };
};

// == Client Side =================================================================
// REF: https://nextjs.org/docs/advanced-features/custom-error-page#more-advanced-error-page-customizing
function Error({ statusCode }: ServerSideProps) {
  return (
    <p>
      {statusCode
        ? `An error ${statusCode} occurred on server`
        : 'An error occurred on client'}
    </p>
  );
}

// --------------------------------------------------------------------------------
// Export without a wrapper since its the Error page.
export default Error;
