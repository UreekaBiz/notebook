
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { getLogger, NotebookService, Logger, PublishedNotebookTuple } from '@ureeka-notebook/web-service';

import { WrappedPage } from 'core/wrapper';
import { NotebookTopBar } from 'notebook/component/NotebookTopBar';
import { NotebookServiceWrapper } from 'notebook/NotebookServiceWrapper';
import { FullPageLayout } from 'shared/layout/FullPageLayout';
import { useIsMounted } from 'shared/hook';
import { publishedNotebookRoute } from 'shared/routes';

const log = getLogger(Logger.NOTEBOOK);

// ********************************************************************************
// NOTE: this page uses Static Site Generation. See pages/README.md
// == Client Side =================================================================
function PublishedNotebookListPage() {
  const [publishedNotebooks, setPublishedNotebooks] = useState<PublishedNotebookTuple[]>([]);

  const isMounted = useIsMounted();

  // -- Effects -------------------------------------------------------------------
  useEffect(() => {
    const subscription = NotebookService.getInstance().onPublishedNotebooks$({ sort: [{ field: 'title', direction: 'asc' }] }).subscribe({
      next: value => {
        if(!isMounted()) return/*component is unmounted, prevent unwanted state updates*/;
        setPublishedNotebooks(value);
      },
      error: (error) => {
        log.error('Error getting Notebooks, reason: ', error);
        if(!isMounted()) return/*component is unmounted so nothing to do*/;
      },
    });

    return () => subscription.unsubscribe();
  }, [isMounted]/*only on mount/unmount*/);

  // -- UI ------------------------------------------------------------------------
  return (
    <FullPageLayout>
      <NotebookTopBar />
      {publishedNotebooks.map(publishedNotebook => (
        <div key={publishedNotebook.id}>
          <span>Title: {publishedNotebook.obj.title}</span>
          <span>, Snippet: {publishedNotebook.obj.snippet}</span>
          <span>, Image: {publishedNotebook.obj.image}</span>
          <span>, Image: {publishedNotebook.obj.image}</span>
          <span>, Image: {publishedNotebook.obj.updateTimestamp.toDate().toDateString()}</span>
          <Link href={publishedNotebookRoute(publishedNotebook.id)}>
            <a>Click Me!</a>
          </Link>
        </div>
      ))}
    </FullPageLayout>
  );
}

// --------------------------------------------------------------------------------
// SEE: core/wrapper.tsx for more information
const Page: WrappedPage = PublishedNotebookListPage;
      Page.wrappers = [NotebookServiceWrapper]/*outer to inner order*/;

export default Page;
