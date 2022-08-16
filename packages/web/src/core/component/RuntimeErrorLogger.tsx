import { useEffect } from 'react';

import { getLogger, Logger } from '@ureeka-notebook/web-service';

const log = getLogger(Logger.DEFAULT);

// ********************************************************************************
/** logs all unhandled runtime errors to the server */
// NOTE: This is different to the ErrorBoundary since this only logs errors that
//       are not caught by the ErrorBoundary or a try/catch block. This is useful
//       for doing forensic analysis of unhandled errors.
export const RuntimeErrorLogger = () => {
  useEffect(() => {
    const handler = (event: ErrorEvent) => {
      log.error('Unhandled error: ', event.error);
    };

    window.addEventListener('error', handler);
    return () => { window.removeEventListener('error', handler); };
  }, []);

  return null/*nothing to render*/;
};
