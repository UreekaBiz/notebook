import { useToast } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useEffect } from 'react';

import { getLogger, NotebookIdentifier, Logger } from '@ureeka-notebook/web-service';

import { RequiredAuthUserWrapper } from 'authUser/RequiredAuthUserWrapper';
import { WrappedPage } from 'core/wrapper';
import { LabelServiceWrapper } from 'label/LabelServiceWrapper';
import { NotebookProvider } from 'notebook/context/NotebookProvider';
import { useNotebook } from 'notebook/hook/useNotebook';
import { NotebookServiceWrapper } from 'notebook/NotebookServiceWrapper';
import { Editor } from 'notebookEditor/component/Editor';
import { NotebookEditorProvider } from 'notebookEditor/context/NotebookEditorProvider';
import { SideBar } from 'notebookEditor/toolbar/component/SideBar';
import { SideBarLayout } from 'shared/layout/SideBarLayout';
import { coreRoutes } from 'shared/routes';
import { UserProfileServiceWrapper } from 'user/UserProfileServiceWrapper';

const log = getLogger(Logger.NOTEBOOK);

// ********************************************************************************
// NOTE: this page is using Static Site Generation. See pages/README.md
// == Client Side =================================================================
function NotebookEditorPage() {
  // get the notebookId from the URL
  // NOTE: the effect(s) below handle if the notebookId is not found
  const router = useRouter();
  const { notebookId } = router.query as { notebookId: NotebookIdentifier; }/*FIXME: follow a paradigm like in [publishedNotebookId].tsx*/;

  const toast = useToast();

  // -- Effect --------------------------------------------------------------------
  // ensures that notebookId is a valid value. If it's not then the user is redirected
  // to #coreRoutes.root
  useEffect(() => {
    if(notebookId) return/*expected -- nothing else to do*/;

    log.error('User reached NotebookPage without a NotebookId');
    toast({ title: 'Invalid Notebook', status: 'error' });
    router.push(coreRoutes.root);
  }, [notebookId, router, toast]);


  return (
    <NotebookProvider notebookId={notebookId}>
      <InternalNotebookEditorPage />
    </NotebookProvider>
  );
}

// NOTE: InternalNotebookEditor page is meant to be used exclusively as an internal
//       component of NotebookEditorPage. The reason that this components are
//       separated is that to render the metadata of the page it needs access to
//       the loaded notebook and that comes from the NotebookProvider.
const InternalNotebookEditorPage: React.FC = () => {
  const { notebook, notebookId } = useNotebook();

  return (
    <>
     <Head>
        <title>{notebook.name}</title>
        <meta property="og:title" content={notebook.name} key="title" />
     </Head>
      <NotebookEditorProvider notebookId={notebookId} notebook={notebook}>
        <SideBarLayout sidebar={<SideBar />}>
          <Editor />
        </SideBarLayout>
      </NotebookEditorProvider>
    </>
  );
};

// --------------------------------------------------------------------------------
// SEE: core/wrapper.tsx for more information
const Page: WrappedPage = NotebookEditorPage;
      Page.wrappers = [RequiredAuthUserWrapper, UserProfileServiceWrapper, NotebookServiceWrapper, LabelServiceWrapper]/*outer to inner order*/;

export default Page;
