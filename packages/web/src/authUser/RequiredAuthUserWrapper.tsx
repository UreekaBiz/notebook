import { useRouter } from 'next/router';
import { useEffect, ReactNode } from 'react';

import { Loading } from 'shared/component/Loading';
import { coreRoutes } from 'shared/routes';

import { useIsAuth } from './hook/useIsAuth';
import { useIsAuthServiceInitialized } from './hook/useIsAuthServiceInitialized';

// ********************************************************************************
// ensures that children are only rendered when the current User is auth'ed. If a
// User is present on this page it will be redirected to #coreRoutes.login
interface Props { children: ReactNode; }
export const RequiredAuthUserWrapper: React.FC<Props> = ({ children }) => {
  const isAuthServiceInitialized = useIsAuthServiceInitialized();
  const isAuth = useIsAuth();
  const router = useRouter();

  // == Effects ===================================================================
  // client-side redirect when User is not auth'ed
  useEffect(() => {
    if(!isAuthServiceInitialized) return/*wait until service is initialized*/;
    if(isAuth) return/*nothing to do*/;

    router.push(coreRoutes.login);
  }, [isAuth, isAuthServiceInitialized, router]);

  // == UI ========================================================================
  if(!isAuth || !isAuthServiceInitialized) return (<Loading />);

  // auth'ed User -- render component
  return <>{children}</>;
};
