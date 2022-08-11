import Head from 'next/head';
import * as Validate from 'yup';

import { json, notebookPublishedContentDocument, wrapGetServerSideProps, NotebookPublishedContent } from '@ureeka-notebook/ssr-service';
import { notebookEditorTheme } from '@ureeka-notebook/web-service';

import { WrappedPage } from 'core/wrapper';
import { NotebookViewer } from 'notebookEditor/component/NotebookViewer';
import { FullPageLayout } from 'shared/layout/FullPageLayout';

// ********************************************************************************
// NOTE: this page is using Server Side Rendering. See pages/README.md
// == Types =======================================================================
// NOTE: the params must match the route path
export const PublishedNotebookPage_QueryParams_Schema = Validate.object({
  // FIXME: want to use `Identifier_Schema` but then SSR fails with some odd missing
  //        dependency problem (which doesn't make sense since it's just an alias for
  //        what's there now)
  publishedNotebookId: Validate.string()
      .required(),
});
export type PublishedNotebookPage_QueryParams = Readonly<Validate.InferType<typeof PublishedNotebookPage_QueryParams_Schema>>;

interface ServerSideProps {
  publishedNotebook: NotebookPublishedContent;
}

// == Server Side =================================================================
// Redirects the authed user to #coreRoutes.login if it's unauthed. Validated from
// the server-side using cookies.
export const getServerSideProps = wrapGetServerSideProps<ServerSideProps, PublishedNotebookPage_QueryParams>(
{ requiresAuth: false, schema: PublishedNotebookPage_QueryParams_Schema },
async ({ params }) => {
  const notebookId = params!.publishedNotebookId/*validated with schema*/;

  const notebookRef = notebookPublishedContentDocument(notebookId),
        snapshot = await notebookRef.get();
  // FIXME: How to log events on getServerSideProps?
  // eslint-disable-next-line no-console
  if(!snapshot.exists) { console.info(`Published Notebook (${notebookId}) no longer exists.`); return { notFound: true/*redirects caller to 404 page*/ }; }

  const publishedNotebook = snapshot.data()!/*validated above*/;
  return { props: json<ServerSideProps>({ publishedNotebook }) };
});

// == Client Side =================================================================
function PublishedNotebookPage({ publishedNotebook }: ServerSideProps) {
  // get the Theme from the notebookEditorTheme
  const theme = notebookEditorTheme.getStylesheet();

  // == UI ========================================================================
  if(!publishedNotebook) {
    return (
      <FullPageLayout>
        <p>Notebook not found!</p>
      </FullPageLayout>
    );
  } /* else -- Published Notebook was found */

  return (
    <FullPageLayout>
      <Head>
        <title>{publishedNotebook?.title}</title>
        <meta property="og:title" content={publishedNotebook.title} key="title" />

        {/** sets the Theme into the Document
          *  NOTE: using dangerouslySetInnerHTML since it's the only way to correctly
          *        set the theme into the Document. This is safe to use since the
          *        theme is completely controlled by the notebookEditorTheme. */}
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
