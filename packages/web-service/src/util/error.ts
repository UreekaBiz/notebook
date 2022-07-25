import { FunctionsError } from 'firebase/functions';

import { ErrorCode } from '@ureeka-notebook/service-common';

// ********************************************************************************
// ApplicationError and Firebase-based errors have 'code'
export const isFunctionsError = (error: FunctionsError | Error): error is FunctionsError => error.name === 'FirebaseError'/*SEE: FirebaseError*/;

// ================================================================================
// NOTE: ideally simply constructing an ApplicationError would cause that error to
//       be logged. Unfortunately, there is one case where this cannot occur:
//          ./function/rethrowFunctionsError()
//       since that might cause an infinite loop of error, log (which causes error),
//       etc. To circumvent this, ApplicationError does *not* automatically log.
//       #createLogApplicationError() should be used to both log and throw.

// NOTE: must match the signature of @service-common/util/error.ts: ApplicationError
export class ApplicationError extends Error {
  constructor(public code: ErrorCode, message: string, ...optionalParams: any[]) {
    super(message);
    this.code = code;
  }
}

export const createLogApplicationError = (code: ErrorCode, message: string, ...optionalParams: any[]) => {
  // TODO: move to logging to the server!
  console.error(code, message, ...optionalParams);
// TODO: this is useful during development -- somehow provide a way to explicitly enable
//       but have it disabled by default (as it leads to spurious info in the logs)
//    else logInfo(message);

  return new ApplicationError(code, message, ...optionalParams);
};
