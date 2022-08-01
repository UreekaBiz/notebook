import { https, logger } from 'firebase-functions';

import { ErrorCode, HttpStatusCode } from '@ureeka-notebook/service-common';

// ********************************************************************************
export const errorCodeMap: { [name in https.FunctionsErrorCode]: HttpStatusCode } = {
  // TODO: move from literal status codes to HttpStatusCode for sanity
  'ok': 200,
  'cancelled': 499,
  'unknown': 500,
  'invalid-argument': 400,
  'deadline-exceeded': 504,
  'not-found': 404,
  'already-exists': 409,
  'permission-denied': 403,
  'unauthenticated': 401,
  'resource-exhausted': 429,
  'failed-precondition': 400,
  'aborted': 409,
  'out-of-range': 400,
  'unimplemented': 501,
  'internal': 500,
  'unavailable':  503,
  'data-loss': 500,
};

// ================================================================================
// maps from (@ureeka-notebook/service-common: type.ts) ErrorCode to Cloud Functions'
// FunctionErrorCode
export const applicationErrorCodeMap: { [name in ErrorCode]: https.FunctionsErrorCode } = {
  // 3rd party API specific
  'api/read': 'data-loss',
  'api/write': 'data-loss',

  // Auth-specific
  'auth/email-already-exists': 'internal',
  'auth/expired-action-code': 'internal',
  'auth/invalid-action-code': 'invalid-argument',
  'auth/invalid-email': 'invalid-argument',
  'auth/no-user': 'not-found',
  'auth/too-many-requests': 'aborted',
  'auth/unknown': 'unknown',
  'auth/user-not-found': 'not-found',
  'auth/user-disabled': 'internal',
  'auth/wrong-password': 'internal',

  // Configuration-specific
  'config/invalid-argument': 'invalid-argument',

  // Development-specific
  'devel/missing-enum': 'internal',
  'devel/config': 'internal',
  'devel/unhandled': 'internal',

  // Data-specific
  'data/deleted': 'unavailable',
  'data/integrity': 'internal',

  // Datastore-specific
  'datastore/export': 'aborted',
  'datastore/import': 'aborted',
  'datastore/read': 'data-loss',
  'datastore/write': 'data-loss',

  // Firestore Functions-specific
  'functions/ok': 'ok',
  'functions/cancelled': 'cancelled',
  'functions/unknown': 'unknown',
  'functions/invalid-argument': 'invalid-argument',
  'functions/deadline-exceeded': 'deadline-exceeded',
  'functions/not-found': 'not-found',
  'functions/already-exists': 'already-exists',
  'functions/permission-denied': 'permission-denied',
  'functions/resource-exhausted': 'resource-exhausted',
  'functions/failed-precondition': 'failed-precondition',
  'functions/aborted': 'aborted',
  'functions/out-of-range': 'out-of-range',
  'functions/unimplemented': 'unimplemented',
  'functions/internal': 'internal',
  'functions/unavailable': 'unavailable',
  'functions/data-loss': 'data-loss',
  'functions/unauthenticated': 'unauthenticated',

  // Cloud Task-specific
  'task/enqueue': 'data-loss',
  'task/dequeue': 'data-loss',
};

// ================================================================================
/**
 * An {@link Error} type that provides a `code` that the UI can key off of for
 * generating user-facing I18N messages. `message` should be considered internal
 * and is provided for completeness. All errors will be logged automatically.
 */
// NOTE: this is not in @ureeka-notebook/service-common so that each tier can have
//       their own tier-specific approach to logging, etc.
export class ApplicationError extends Error {
  constructor(public code: ErrorCode, message: string, ...optionalParams: any[]) {
    super(message);
    this.code = code;

    logger.error(code, message, ...optionalParams);
// TODO: this is useful during development -- somehow provide a way to explicitly enable
//       but have it disabled by default (as it leads to spurious info in the logs)
//    else logInfo(message);
  }
}
