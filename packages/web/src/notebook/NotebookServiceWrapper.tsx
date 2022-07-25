import { useEffect, useState, ReactNode } from 'react';

import { NotebookService } from '@ureeka-notebook/web-service';

import { Loading } from 'shared/component/Loading';

// ********************************************************************************
interface Props { children: ReactNode; }
export const NotebookServiceWrapper: React.FC<Props> = ({ children }) => {
  // -- State ---------------------------------------------------------------------
  const [initialized, setInitialized] = useState(false/*by definition*/);

  // -- Effects -------------------------------------------------------------------
  useEffect(() => {
    const notebookService = NotebookService.create();
    setInitialized(true);

    return () => notebookService.shutdown();
  }, [/*only on mount*/]);

  // -- UI ------------------------------------------------------------------------
  if(!initialized) return <Loading />;

  return <>{children}</>;
};
