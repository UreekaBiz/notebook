import { useEffect, useState, ReactNode } from 'react';

import { UserProfileService } from '@ureeka-notebook/web-service';

import { Loading } from 'shared/component/Loading';

// ********************************************************************************
interface Props { children: ReactNode; }
export const UserProfileServiceWrapper: React.FC<Props> = ({ children }) => {
  // -- State ---------------------------------------------------------------------
  const [initialized, setInitialized] = useState(false/*by definition*/);

  // -- Effects -------------------------------------------------------------------
  useEffect(() => {
    UserProfileService.create();
    setInitialized(true);

    // FIXME: No shutdown?
    // return () => userProfileService.shutdown();
  }, [/*only on mount*/]);

  // -- UI ------------------------------------------------------------------------
  if(!initialized) return <Loading />;

  return <>{children}</>;
};
