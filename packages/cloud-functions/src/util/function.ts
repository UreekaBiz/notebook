import { Response } from 'express';
import { DocumentSnapshot } from 'firebase-admin/firestore';
import * as functions from 'firebase-functions';
import { logger, RuntimeOptions } from 'firebase-functions';
import { CallableContext, FunctionsErrorCode, Request } from 'firebase-functions/lib/providers/https';
import { AnySchema, ValidationError } from 'yup';

import { convertNullDeep, isAdminRole as isAdminUserRole, isType, redact, HttpStatusCode, Modify, UserIdentifier, UserRole, VersionResponse, VERSION_REQUEST } from '@ureeka-notebook/service-common';

import { logFunctionInvocation } from '../logging/logging';
import { getEnv, FUNCTION_REGION, PROJECT_ID } from './environment';
import { applicationErrorCodeMap, errorCodeMap, ApplicationError } from './error';
import { getTaskHeaderData, TaskHeaderData } from './google/task';

// convenience types and functions for working with HTTPS Cloud Functions
// ********************************************************************************
export const LongrunningRuntimeOpts: RuntimeOptions = {
  timeoutSeconds: 540/*s -- maximum allowed*/,
};
export const MaintenanceRuntimeOpts: RuntimeOptions = {
  memory: '4GB'/*max*/,
  timeoutSeconds: 540/*s -- maximum allowed*/,
};

export const RetryRuntimeOpts: RuntimeOptions = {
  failurePolicy: true/*retry*/,
};

// -- Memory ----------------------------------------------------------------------
// NOTE: default is '256MB'
export const SmallMemory: RuntimeOptions = {
  memory: '512MB',
};
export const MediumMemory = isType<functions.RuntimeOptions>({
  memory: '1GB',
});
export const LargeMemory = isType<functions.RuntimeOptions>({
  memory: '2GB',
});

// ********************************************************************************
// ... Constants ..................................................................
// the maximum amount of time (in millis) that an event can be delayed before it is
// not retried
export const MAX_EVENT_AGE = 5/*min*/ * 60/*sec/min*/ * 1000/*ms/sec*/; /*guess!*/

// -- Callable / Request ----------------------------------------------------------
// NOTE: mirrors Cloud Function's interface
export type HttpsFunction = (req: Request, res: Response) => Promise<void> | void;

type CallHandler<T = any, R = any> = (data: T, context: CallableContext, userId?: UserIdentifier) => R | Promise<R>;
type RequestHandler<T, R> = (data: T, request: Request) => Promise<R>;

// -- Tasks -----------------------------------------------------------------------
type TaskHandler<T, R> = (data: T, taskHeaderData: TaskHeaderData) => Promise<R>;

// -- Triggers --------------------------------------------------------------------
type ContextParams = Record<string, any>;
type EventContext<T extends ContextParams> = Modify<functions.EventContext, { params: T; }>;

// .. PubSub Scheduled ............................................................
type OnRunHandler = (context: functions.EventContext) => PromiseLike<any> | any;

// .. Firestore ...................................................................
type OnCreateOrDeleteHandler<T, C extends ContextParams> = (snapshot: DocumentSnapshot<T>, context: EventContext<C>) => PromiseLike<any> | any;
type OnWriteHandler<T, C extends ContextParams> = (change: functions.Change<T>, context: EventContext<C>) => PromiseLike<any> | any;

// .. Firebase Auth ...............................................................
type AuthOnCreateOrDeleteHandler<C extends ContextParams> = (user: functions.auth.UserRecord, context: EventContext<C>) => PromiseLike<any> | any;

// .. Firebase Storage ............................................................
type OnFinalize<C extends ContextParams> = (object: functions.storage.ObjectMetadata, context: EventContext<C>) => PromiseLike<any> | any;

// ********************************************************************************
// retrieves the host and domain for the HTTPS Cloud Function being called
export const getFunctionDomain = () => {
  const domain = 'cloudfunctions.net'/*static*/;
  return `${FUNCTION_REGION}-${PROJECT_ID}.${domain}`;
};

// ================================================================================
// all options allowed for a wrapped callable
export type CallableOptions = Readonly<{
  /** name of the function which is used for logging */
  name?: string;
  /** the schema that the passed in data must validate against */
  schema?: AnySchema<any>;

  /** an array of fields (in data) that are not included within the automatic
   *  logging that occurs (if {@link #name} is set) */
  // CHECK: should this be 'redactLog' so that there's a possibility of transform
  //        for 'data' itself?
  redact?: string[]/*the paths of fields to be redacted*/;

  // NOTE: 'context' is required and therefore not valid for #onRequest()
  // NOTE: these are in waterfall order
  /** is the caller one of the specified Admin roles? if present take precedence
   *  over `requiresAdmin` and implies (even if empty) Application Admin (not present
   *  by default) */
  adminRoles?: UserRole[];
  /** is Application Admin required? if true takes precedence over `requiresAuth`
   *  (false by default) */
  requiresAdmin?: boolean;
  /** is auth required? true by default */
  requiresAuth?: boolean;

  /** should all (shallow) `null` in the passed in data get converted to `undefined`?
   *  This is for convenience as Cloud Functions send `undefined` as `null` across REST. */
  convertNullToUndefined?: boolean/*default false*/;
}>;

// == Process Callable Options ====================================================
const processOptions = async <T extends object>(opts: CallableOptions, data: T, context?: CallableContext) => {
  if((opts.adminRoles !== undefined) && context) {
    hasAdminRole(opts.adminRoles, context)/*throws if not Admin or is not auth'd*/;
  } else if((opts.requiresAdmin === true)/*default false*/ && context) {
    hasAdmin(context)/*throws if not Application Admin or is not auth'd*/;
  } else if((opts.requiresAuth !== false)/*default true*/ && context) {
    hasAuth(context)/*throws if not auth'd*/;
  } /* else -- no auth checks (or didn't supply a context) */

  if(opts.name) { /*has a name so log this call*/
    // CHECK: always redact 'password' -except- when the caller explicitly blacklists?
    const dataClone = opts.redact
                        ? redact(data, opts.redact)
                        : data;
    await logFunctionInvocation(opts.name, dataClone, context);
  } /* else -- no name specified */
  if(opts.name) {
    logger.log(opts.name, data, context);
  } /* else -- no name specified */

  // NOTE: transforms *must* be completed before validation
  if(opts.convertNullToUndefined) {
    // NOTE: since 'data' just came from the request (which is JSON), it cannot
    //       contain any objects that would cause the deep conversion to fail
    data = convertNullDeep(data, undefined/*contract*/);
  } /* else -- leave data unchanged */

  if(opts.schema) {
    validateData(data, opts.schema)/*throws on error*/;
  } /* else -- no schema to validate against */

  return data;
};

// == Wrapped Call ================================================================
export const wrapCall = <T extends object, R = void>(opts: CallableOptions, handler: CallHandler<T, R>): CallHandler => {
  // @ts-ignore: catch always throws so all paths return
  return async (data: T, context: CallableContext) => {
    try {
      // check for keep-alive / version check first to ensure that it doesn't get
      // processed in any other way
      if((data !== null) && (VERSION_REQUEST in data)) {
        return isType<VersionResponse>({
          buildDate: String(getEnv('BUILD_DATE')),
          version: String(getEnv('VERSION')),
          gitBranch: String(getEnv('GIT_BRANCH')),
          gitHash: String(getEnv('GIT_HASH')),
        });
      } /* else -- not keep-alive / version check */

      data = await processOptions(opts, data, context)/*throws on error*/;

      return await handler(data, context, context.auth?.uid);
    } catch(error) {
      mimicHttpsOnCallExceptions(error)/*throws on error*/;
    }
  };
};

// == Wrapped Request =============================================================
export const wrapRequest = <T extends object, R = void>(opts: CallableOptions, handler: RequestHandler<T, R>): HttpsFunction => {
  return async (req: Request, res: Response) => {
    let status: HttpStatusCode = HttpStatusCode.InternalServerError/*default to error for sanity*/,
        body: any;

    try {
      await processOptions(opts, req.body)/*throws on error*/;

      body = await handler(req.body, req);
      status = HttpStatusCode.OK;
    } catch(error) {
      const result = mimicOnRequestException(error);
      status = result.status;
      body = result.body;
    } finally {
      res.status(status).send(body)/*must be the last call by contract*/;
    }
  };
};

// == Wrapped Task ================================================================
 export const wrapTask = <T extends object, R = void>(opts: CallableOptions, handler: TaskHandler<T, R>): HttpsFunction => {
  const func = async (req: Request, res: Response) => {
    let status: HttpStatusCode = HttpStatusCode.InternalServerError/*default to error for sanity*/,
        body: any;
    try {
      const data = await processOptions(opts, req.body)/*throws on error*/;
      const taskHeaderData = getTaskHeaderData(req);
      body = await handler(data, taskHeaderData);
      status = HttpStatusCode.OK;
    } catch(error) {
      const result = mimicOnRequestException(error);
      status = result.status;
      body = result.body;
    } finally {
      res.status(status).send(body)/*must be the last call by contract*/;
    }
  };
  return func;
};

// == PubSub Scheduled ============================================================
// -- onRun -----------------------------------------------------------------------
export const wrapOnRun = (handler: OnRunHandler): OnRunHandler => {
  // NOTE: if this is changed then likely #wrapOnXXX() should be as well!
  const func = async (context: functions.EventContext) => {
    try {
      return await handler(context);
    } catch(error) {
      // TODO: allow -some- Exception to propagate out so that the trigger could be
      //       retried

      // NOTE: ApplicationError are logged by design so there's no need to log again
      if(!(error instanceof ApplicationError)) {
        logger.error('devel/unhandled', error);
      } /* else -- ApplicationError has already been logged */
    }
  };
  return func;
};

// == Firestore Triggers ==========================================================
// -- onCreate / onDelete ---------------------------------------------------------
export const wrapOnCreateOrDelete = <T, C extends ContextParams = {}>(handler: OnCreateOrDeleteHandler<T, C>): OnCreateOrDeleteHandler<any/*Firestore API doesn't expect a type*/, any/*Firestore API doesn't expect a type*/> => {
  // NOTE: if this is changed then likely #wrapOnXXX() should be as well!
  const func = async (snapshot: DocumentSnapshot<T>, context: EventContext<C>) => {
    // prevent runaway retries
    // REF: https://cloud.google.com/functions/docs/bestpractices/retries#set_an_end_condition_to_avoid_infinite_retry_loops
    const eventAgeMillis = Date.now() - Date.parse(context.timestamp);
    if(eventAgeMillis > MAX_EVENT_AGE) { logger.warn(`On-Create / On-Delete trigger retry aborted due to timeout (${eventAgeMillis}ms).`); return/*avoid an infinite loop of retries*/; }

    try {
      return await handler(snapshot, context);
    } catch(error) {
      // TODO: allow -some- Exception to propagate out so that the trigger could be
      //       retried

      // NOTE: ApplicationErrors are logged by design so there's no need to log again
      if(!(error instanceof ApplicationError)) {
        logger.error('devel/unhandled', error);
      } /* else -- ApplicationError has already been logged */
    }
  };
  return func;
};

// -- onWrite ---------------------------------------------------------------------
export const wrapOnWrite = <T, C extends ContextParams = {}>(handler: OnWriteHandler<T, C>): OnWriteHandler<any/*Firestore API doesn't expect a type*/, any/*Firestore API doesn't expect a type*/> => {
  // NOTE: if this is changed then likely #wrapOnXXX() should be as well!
  const func = async (change: functions.Change<T>, context: EventContext<C>) => {
    // TODO: add code from above to prevent runaways!

    try {
      return await handler(change, context);
    } catch(error) {
      // TODO: allow -some- Exception to propagate out so that the trigger could be
      //       retried

      // NOTE: ApplicationErrors are logged by design so there's no need to log again
      if(!(error instanceof ApplicationError)) {
        logger.error('devel/unhandled', error);
      } /* else -- ApplicationError has already been logged */
    }
  };
  return func;
};

// == Firebase Auth Trigger =======================================================
// -- onCreate / onDelete ---------------------------------------------------------
export const wrapAuthOnCreateOrDelete = <C extends ContextParams = {}>(handler: AuthOnCreateOrDeleteHandler<C>): AuthOnCreateOrDeleteHandler<any/*Firestore API doesn't expect a type*/> => {
  // NOTE: if this is changed then likely #wrapOnXXX() should be as well!
  const func = async (user: functions.auth.UserRecord, context: EventContext<C>) => {
    // prevent runaway retries
    // REF: https://cloud.google.com/functions/docs/bestpractices/retries#set_an_end_condition_to_avoid_infinite_retry_loops
    const eventAgeMillis = Date.now() - Date.parse(context.timestamp);
    if(eventAgeMillis > MAX_EVENT_AGE) { logger.warn(`Auth On-Create / On-Delete trigger retry aborted due to timeout (${eventAgeMillis}ms).`); return/*avoid an infinite loop of retries*/; }

    try {
      return await handler(user, context);
    } catch(error) {
      // TODO: allow -some- Exception to propagate out so that the trigger could be
      //       retried

      // NOTE: ApplicationErrors are logged by design so there's no need to log again
      if(!(error instanceof ApplicationError)) {
        logger.error('devel/unhandled', error);
      } /* else -- ApplicationError has already been logged */
    }
  };
  return func;
};

// == Firebase Storage ============================================================
// -- onFinalize ------------------------------------------------------------------
export const wrapOnFinalize = <C extends ContextParams = {}>(handler: OnFinalize<C>): OnFinalize<any/*Firestore API doesn't expect a type*/> => {
  const func = async (object: functions.storage.ObjectMetadata, context: EventContext<C>) => {
    // prevent runaway retries
    // REF: https://cloud.google.com/functions/docs/bestpractices/retries#set_an_end_condition_to_avoid_infinite_retry_loops
    const eventAgeMillis = Date.now() - Date.parse(context.timestamp);
    if(eventAgeMillis > MAX_EVENT_AGE) { logger.warn(`Storage On-Finalize trigger retry aborted due to timeout (${eventAgeMillis}ms).`); return/*avoid an infinite loop of retries*/; }

    try {
      return await handler(object, context);
    } catch(error) {
      // TODO: allow -some- Exception to propagate out so that the trigger could be
      //       retried

      // NOTE: ApplicationErrors are logged by design so there's no need to log again
      if(!(error instanceof ApplicationError)) {
        logger.error('devel/unhandled', error);
      } /* else -- ApplicationError has already been logged */
    }
  };
  return func;
};

// == Auth Checks =================================================================
const hasAdminRole = (adminRoles: UserRole[], context: CallableContext) => {
  hasAuth(context)/*by contract*/;
  if(!isAdminRole(context, adminRoles)) throw new ApplicationError('functions/permission-denied', `Request not authorized. User must be an Administrator to fulfill request (${context.auth!.uid}).`);
};

const hasAdmin = (context: CallableContext) => {
  hasAuth(context)/*by contract*/;
  if(!context.auth!.token[UserRole.Admin]) throw new ApplicationError('functions/permission-denied', `Request not authorized. User must be an Application Administrator to fulfill request (${context.auth!.uid}).`);
};

const hasAuth = (context: CallableContext) => {
  if(!context) throw new ApplicationError('functions/permission-denied', `Attempted to call an HTTPS Cloud Function with no context.`);
  if(!context.auth) throw new ApplicationError('functions/permission-denied', `Attempted to call an HTTPS Cloud Function with no auth.`);
};

// ................................................................................
const isAdminRole = (context: CallableContext, adminRoles: UserRole[]): boolean => {
  if(!context || !context.auth) return false/*by contract*/;

  const validAdminRoles = adminRoles.filter(role => isAdminUserRole(role))/*only consider admin roles by contract*/,
        adminRoleSet = new Set([...validAdminRoles, UserRole.Admin/*by contract*/]);
  return [...adminRoleSet].some(role => (context.auth!.token[role] !== undefined));
};

// == Schema Validation ===========================================================
export const validateData = (data: any, schema: AnySchema<any>) => {
  try {
    schema.validateSync(data, {
      abortEarly: false/*report all errors*/,
      strict: false/*true prevents ISO dates from being passed as strings to date()*/,
      stripUnknown: false/*don't strip -- meaning fail on unknown parameters*/,
    });
  } catch(error) {
    let message = `Callable data failed schema check.`;
    if(error instanceof ValidationError) {
      if(error.errors.length > 0) message += ` Validation errors: ` + error.errors.map(error => `"${error}"`);
      logger.error(message);
    } else {/*something other than ValidationError*/
      if(error instanceof Error) message += `Reason: ${error.message}`;
      else message += `Reason: ${error}`;
      logger.error(message,
                    `\n\tReceived: `, JSON.stringify(data),
                    `\n\tWanted: `, JSON.stringify(schema.describe()));
    }
    throw new ApplicationError('functions/invalid-argument', message);
  }
};

// == Error Handling ==============================================================
const mimicHttpsOnCallExceptions = (error: any) => {
  if(error instanceof ApplicationError) {
    // NOTE: ApplicationErrors are logged by design so no need to log here
    const functionErrorCode = applicationErrorCodeMap[error.code];
    throw new functions.https.HttpsError(functionErrorCode, error.message, { code: error.code });
  } /* else -- default handler will convert as necessary */

  logger.error('devel/unhandled', error)/*log to provide record of it*/;
  throw error/*mimics default functions.https.onCall() behavior*/;
};

// NOTE: 'res', the response, should be considered 'complete' (i.e. never updated)
//       after this call, by contract
const mimicOnRequestException = (error: any) => {
  const isApplicationError = (error instanceof ApplicationError),
        isHttpsError = (error instanceof functions.https.HttpsError);

  // NOTE: ApplicationErrors are logged by default so this logs non-ApplicationErrors
  //       for consistency
  if(!isApplicationError) logger.error('devel/unhandled', error);

  if(!isApplicationError && !isHttpsError) {
    const text = `Unhandled error: ` + error;
    error = new functions.https.HttpsError('internal', text);
  } /* else -- a known error type (ie. either HttpsError or ApplicationError) */

  const errorCode = (error instanceof ApplicationError)/*type-guard*/
                    ? applicationErrorCodeMap[error.code]
                    : error.code as FunctionsErrorCode;
  const status = errorCodeMap[errorCode],
        body = { error: JSON.stringify(error) };
  return { status, body };
};
