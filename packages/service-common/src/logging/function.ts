import * as Validate from 'yup';

import { stringShortSchema, stringVLongSchema, urlSchema } from '../util/schema';
import { Identifier_Schema, Modify } from '../util/type';
import { LogLevel } from './type';

// ********************************************************************************
// this is primarily used to determine if the resulting log-line will contain an
// 'httpRequest' at the top-level or not (which will then determine how Stackdriver's
// "Log Viewer" will display the data).
export enum LogView {
  HttpRequest = 'http',
  Message = 'message'/*the default if not specified*/,
}

// ================================================================================
export const ClientLog_Rest_Schema = Validate.object({
  logName: stringShortSchema/*any other constraints?*/
          .min(1/*cannot be blank*/)
          .required(),
  severity: Validate.string()
          .oneOf(Object.values(LogLevel))
          .required(),
  view: Validate.string()
          .oneOf(Object.values(LogView))
          .notRequired()/*defaults to Message*/,

  // NOTE: required but may be blank
  // REF: https://github.com/jquense/yup/issues/600
  message: stringVLongSchema/*any other constraints?*/
          .required()
          .min(0/*allow blank*/),

  // the page where the logging occurred (for context)
  httpRequest: Validate.object({
    method: Validate.string()
          .oneOf(['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'])
          .required(),
    url: urlSchema
          .required(),
    userAgent: Validate.string()
          .min(1/*cannot be blank*/)
          .required(),
    // CHECK: include status? Does it make sense in a React-based world?
  }).required(),

  // User context if available (specifically, if logged in!)
  // SEE: https://github.com/jquense/yup/issues/348#issuecomment-433582869
  context: Validate.object({
    userId: Identifier_Schema
          .required(),
    sessionId: Identifier_Schema
          .required(),
  }).default(null/*default value when not specified*/)
    .nullable(),

  // where the logging occurred (and the associated version of the code / service)
  source: Validate.object({
    service: Validate.string()
          .min(1/*cannot be blank*/)
          .required(),
    version: Validate.string()
          .min(1/*cannot be blank*/)
          .required(),

    gitBranch: Validate.string()
          .min(1/*cannot be blank*/)
          .required(),
    gitVersion: Validate.string()
          .min(1/*cannot be blank*/)
          .required(),

    // NOTE: not all platforms provide stacktraces
    file: Validate.string()
          .nullable()/*NOTE: 'not required' actually comes across REST as 'null'*/
          .notRequired(),
    line: Validate.number()
          .nullable()/*NOTE: 'not required' actually comes across REST as 'null'*/
          .notRequired(),
    'function': Validate.string()
          .nullable()/*NOTE: 'not required' actually comes across REST as 'null'*/
          .notRequired(),
  }).required(),

  // client's definition of when it happened
  timestamp: Validate.date()
          .required(),
});
export type ClientLog_Rest = Readonly<Modify<Validate.InferType<typeof ClientLog_Rest_Schema>, {
  severity: LogLevel/*explicit*/;
  view: LogView/*explicit*/;

  timestamp: string/*ISO date string validated as a Date*/;
}>>;
