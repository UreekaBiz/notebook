import { useCallback, useEffect, useRef } from 'react';

// ********************************************************************************
// hook that tracks the mount / unmount life cycle of a component
// NOTE: this is inspired by https://usehooks-ts.com/react-hook/use-is-mounted
export const useIsMounted = () => {
  const isMounted = useRef(false/*not mounted by default*/);

  useEffect(() => {
    isMounted.current = true/*mounted by definition*/;

    return () => { isMounted.current = false/*not mounted by definition*/; };
  }, [/*only on mount/unmount*/]);

  return useCallback(() => isMounted.current, [/*only on mount/unmount*/]);
};
