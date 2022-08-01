import Head from 'next/head';
import * as Validate from 'yup';

import { json, publishedNotebookDocument, wrapGetServerSideProps, PublishedNotebook } from '@ureeka-notebook/ssr-service';

import { WrappedPage } from 'core/wrapper';
import { NotebookViewer } from 'notebookEditor/component/NotebookViewer';
import { notebookEditorTheme } from 'notebookEditor/extension/theme/theme';
import { FullPageLayout } from 'shared/layout/FullPageLayout';

// ********************************************************************************
// NOTE: this page is using Server Side Rendering. See pages/README.md
// == Types =======================================================================
// NOTE: the params must match the route path
export const PublishedNotebookPage_QueryParams_Schema = Validate.object({
  publishedNotebookId: Validate.string()
    .required(),
});
export type PublishedNotebookPage_QueryParams = Readonly<Validate.InferType<typeof PublishedNotebookPage_QueryParams_Schema>>;

interface ServerSideProps {
  publishedNotebook: PublishedNotebook;
}

// == Server Side =================================================================
// Redirects the authed user to #coreRoutes.login if it's unauthed. Validated from
// the server-side using cookies.
export const getServerSideProps = wrapGetServerSideProps<ServerSideProps, PublishedNotebookPage_QueryParams>(
{ requiresAuth: false, schema: PublishedNotebookPage_QueryParams_Schema },
async ({ params }) => {
  const publishedNotebookId = params!.publishedNotebookId/*validated with schema*/;

  const notebookRef = publishedNotebookDocument(publishedNotebookId),
        snapshot = await notebookRef.get();
  // FIXME: How to log events on getServerSideProps?
  // eslint-disable-next-line no-console
  if(!snapshot.exists) { console.info(`Published Notebook (${publishedNotebookId}) no longer exists.`); return { notFound: true/*redirects caller to 404 page*/ }; }
  // TODO: Validate if the notebook is not deleted.

  const publishedNotebook = snapshot.data()!/*validated above*/;
  return { props: json<ServerSideProps>({ publishedNotebook }) };
});

// == Client Side =================================================================
function PublishedNotebookPage({ publishedNotebook }: ServerSideProps) {
  // Get the theme from the notebookEditorTheme
  const theme = notebookEditorTheme.getStylesheet();

  // == UI ========================================================================
  if(!publishedNotebook) return (
    <FullPageLayout>
      <p>Notebook not found!</p>
    </FullPageLayout>
  ); // else -- published notebook was found

  return (
    <FullPageLayout>
      <Head>
        <title>{publishedNotebook?.title}</title>
        <meta property="og:title" content={publishedNotebook.title} key="title" />

        {/**
         * sets the theme into the Document
         * NOTE: Using dangerouslySetInnerHTML since it's the only way to correctly
         *       set the theme into the Document. This is safe to use since the
         *        theme is completely controlled by the notebookEditorTheme.
         */}
        <style dangerouslySetInnerHTML={{ __html: theme }}/>
      </Head>
      <NotebookViewer content={publishedNotebook.content} />
    </FullPageLayout>
  );
}

// --------------------------------------------------------------------------------
// SEE: core/wrapper.tsx for more information
const Page: WrappedPage<ServerSideProps> = PublishedNotebookPage;
      Page.wrappers = [/*no wrappers*/];

export default Page;
