import { HttpsCallable } from 'firebase/functions';

import { isCodedError } from '@ureeka-notebook/service-common';

import { isFunctionsError, ApplicationError } from './error';

// ********************************************************************************

// == Convenience =================================================================
export const wrapHttpsCallable = <T, R = any>(httCallable: HttpsCallable<T, R>): HttpsCallable<T, R> => {
  const fn = async (data?: T | null) => {
    try {
      return await httCallable(data);
    } catch(error) {
      throw rethrowFunctionsError(error);
    }
  };
  return fn;
};

// --------------------------------------------------------------------------------
// SEE: @ureeka-notebook/cloud-function: util/function.ts - #wrapCall()
// SEE: @ureeka-notebook/cloud-function: util/function.ts - #mimicHttpsOnCallExceptions()
const rethrowFunctionsError = (error: any/*what TypeScript considers the 'error' in 'catch'*/) => {
  // NOTE: any errors are logged to the *console* and not to a logger since the
  //       logger may try to log back to the server via a Cloud Function which in
  //       turn might call this ad infinitum
  if(isFunctionsError(error)) {
    console.error(error.code, error.message)/*explicitly log by contract*/;
    return new ApplicationError(error.code, error.message);
  } else if(error instanceof ApplicationError) {
    return error/*no translation needed*/;
  } else if(isCodedError(error) && (error['code'] === 'internal') && (error.message === 'internal')) {
    // NOTE: determined by T&E that this error means that the network is unavailable
    console.error('internal', error.message)/*explicitly log by contract*/;
    return new ApplicationError('functions/internal', `Internet disconnected.`);
  } else {
    console.warn(`Unknown error type from Https Cloud Function: `, error);
    console.error('internal', error.message)/*explicitly log by contract*/;
    return new ApplicationError('functions/internal', error.message);
  }
};
