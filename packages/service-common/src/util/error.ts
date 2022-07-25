// ********************************************************************************
export interface CodedError extends Error { code: string; }
export const isCodedError = (error: any/*what TypeScript considers the 'error' in 'catch'*/): error is CodedError => 'code' in error;

// ================================================================================
// NOTE: the base set was derived from Cloud Function's `FunctionsErrorCode`
// NOTE: if this is updated the @ureeka-notebook/cloud-functions: util/function.ts
//       *must* be updated
// NOTE: ErrorCodes are shared between Web and Cloud Functions primarily because
//       they are often communicated across the boundary. It may be that the best
//       solution is that there are also separate codes for each tier. Currently
//       they're all shared for simplicity.

// Firebase Auth
// REF: attempts to mimic: https://firebase.google.com/docs/auth/admin/errors
export type AuthErrorCode =
  | 'auth/email-already-exists'
  | 'auth/expired-action-code'
  | 'auth/invalid-action-code'
  | 'auth/invalid-email'
  | 'auth/no-user'
  | 'auth/too-many-requests'
  | 'auth/unknown'
  | 'auth/user-not-found'
  | 'auth/user-disabled'
  | 'auth/wrong-password'
  ;

// Cloud Task-specific
export type CloudTaskErrorCode =
  | 'task/enqueue' /*could not enqueue task*/
  | 'task/dequeue' /*could not dequeue task*/
  ;

// Configuration-specific
export type ConfigurationErrorCode =
  | 'config/invalid-argument'
  ;

// Datastore-specific
export type DatastoreErrorCode =
  | 'datastore/export' /*could not export from backing datastore*/
  | 'datastore/import' /*could not import from backing datastore*/
  | 'datastore/read' /*could not read from backing datastore*/
  | 'datastore/write' /*could not write to backing datastore*/
  ;

// Data-specific
export type DataErrorCode =
  | 'data/deleted' /*associated resource has already been deleted*/
  | 'data/integrity' /*expected constraint or relation did not exist*/
  ;

// Development-specific
export type DevelopmentErrorCode =
  | 'devel/missing-enum' /*enum value was added without accounting for it*/
  | 'devel/config' /*missing / misconfigured configuration*/
  | 'devel/unhandled' /*exception bubbled to top without handler*/
  ;

// Firestore Functions-specific
export type FunctionsErrorCode =
  | 'functions/ok'
  | 'functions/cancelled'
  | 'functions/unknown'
  | 'functions/invalid-argument'
  | 'functions/deadline-exceeded'
  | 'functions/not-found'
  | 'functions/already-exists'
  | 'functions/permission-denied'
  | 'functions/resource-exhausted'
  | 'functions/failed-precondition'
  | 'functions/aborted'
  | 'functions/out-of-range'
  | 'functions/unimplemented'
  | 'functions/internal'
  | 'functions/unavailable'
  | 'functions/data-loss'
  | 'functions/unauthenticated'
  ;

// 3rd party API specific
export type ThirdPartyAPIErrorCode =
  | 'api/read' /*could not read from a 3rd party API*/
  | 'api/write' /*could not write to a 3rd party API*/
  ;

// ................................................................................
export type ErrorCode =
  | AuthErrorCode
  | CloudTaskErrorCode
  | ConfigurationErrorCode
  | DatastoreErrorCode
  | DataErrorCode
  | DevelopmentErrorCode
  | FunctionsErrorCode
  | ThirdPartyAPIErrorCode
  ;

// --------------------------------------------------------------------------------
// ApplicationError's are defined per-tier and are always logged
export declare class ApplicationError {
  code: ErrorCode;
  message: string;
  constructor(code: ErrorCode, message: string, ...optionalParams: any[]);
}

// in order to throw ApplicationErrors within service-common, `throw new ApplicationError()`
// cannot be used. This must be used instead
// NOTE: unlike ApplicationError, these errors are *not* logged
export const createApplicationError = (code: ErrorCode, message?: any, ...optionalParams: any[]) =>
  new class extends Error {
    constructor(public readonly code: ErrorCode, message?: any, ...optionalParams: any[]) {
      super(`${message}${optionalParams.join('')}`);
    }
  }(code, message, optionalParams);

// CHECK: can this be better qualified?
// REF: https://www.typescriptlang.org/docs/handbook/advanced-types.html#using-type-predicates
export const isApplicationError = (error: ApplicationError | Error): error is ApplicationError => (error as ApplicationError).code !== undefined;

// ================================================================================
// REF: https://stackoverflow.com/questions/18391212/is-it-not-possible-to-stringify-an-error-using-json-stringify
export const replaceErrors = (value: any) => {
  if(!(value instanceof Error)) return value;

  const error: any = {};
  Object.getOwnPropertyNames(value).forEach(name => error[name] = (value as any)[name]);
  return error;
};

// --------------------------------------------------------------------------------
// an object de-cycler to be used before objects are passed to JSON.stringify()
// REF: https://github.com/douglascrockford/JSON-js/blob/master/cycle.js
export const decycle = (object: any) => {
  const references = new WeakMap<any, string>();

  const replace = (value: any, path: string) => {
    value = replaceErrors(value);

    if(    (typeof value === 'object')
        && (value !== null)
        && !(value instanceof Boolean)
        && !(value instanceof Date)
        && !(value instanceof Number)
        && !(value instanceof RegExp)
        && !(value instanceof String)
    ) {
      const reference = references.get(value);
      if(reference !== undefined) return { ['$ref']: reference };
      references.set(value, path);

      if(Array.isArray(value)) {
        const replaced: any[] = [];
        value.forEach((element, index) => replaced[index] = replace(element, `${path}[${index}]`));
        return replaced;
      } else { /*not an array*/
        const replaced: any = {};
        Object.keys(value).forEach(name => replaced[name] = replace(value[name], `${path}.${JSON.stringify(name)}`));
        return replaced;
      }
    } /* else -- a primitive */
    return value;
  };
  return replace(object, '$');
};
