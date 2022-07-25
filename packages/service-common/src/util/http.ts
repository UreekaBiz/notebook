import { createApplicationError } from './error';

// convenience items for working with HTTP(S)
// ********************************************************************************
// REF: https://developer.mozilla.org/en-US/docs/Web/HTTP/Status
export enum HttpStatusCode {
  // Information
  Continue = 100,
  SwitchingProtocols = 101,
  Processing = 102,
  EarlyHints = 103,

  // Success
  OK = 200,
  Created = 201,
  Accepted = 202,
  NonAuthoritativeInformation = 203,
  NoContent = 204,
  ResetContent = 205,
  PartialContent = 206,
  MultiStatus = 207,
  AlreadyReported = 208,
  IMUsed = 226,

  // Redirect
  MultipleChoice = 300,
  MovedPermanently = 301,
  Found = 302,
  SeeOther = 303,
  NotModified = 304,
  UseProxy = 305,
  // Unused: SwitchProxy = 306,
  TemporaryRedirect = 307,
  PermanentRedirect = 308,

  // Client Error
  BadRequest = 400,
  Unauthorized = 401,
  PaymentRequired = 402,
  Forbidden = 403,
  NotFound = 404,
  MethodNotAllowed = 405,
  NotAcceptable = 406,
  ProxyAuthenticationRequired = 407,
  RequestTimeout = 408,
  Conflict = 409,
  Gone = 410,
  LengthRequired = 411,
  PreconditionFailed = 412,
  PayloadTooLarge = 413,
  URITooLong = 414,
  UnsupportedMediaType = 415,
  RangeNotSatisfiable = 416,
  ExpectationFailed = 417,
  ImATeapot = 418,
  MisdirectedRequest = 421,
  UnprocessableEntity = 422,
  Locked = 423,
  FailedDependency = 424,
  TooEarly = 425,
  UpgradeRequired = 426,
  PreconditionRequired = 428,
  TooManyRequests = 429,
  RequestHeaderFieldsTooLarge = 431,
  UnavailableForLegalReasons = 451,

  // Server Error
  InternalServerError = 500,
  NotImplemented = 501,
  BadGateway = 502,
  ServiceUnavailable = 503,
  GatewayTimeout = 504,
  HTTPVersionNotSupported = 505,
  VariantAlsoNegotiates = 506,
  InsufficientStorage = 507,
  LoopDetected = 508,
  NotExtended = 510,
  NetworkAuthenticationRequired = 511,
}

// ================================================================================
// REF: https://developer.mozilla.org/en-US/docs/Web/HTTP/Status
export enum HttpMetaStatusCode {
  Information = 'Information'/*100–199*/,
  Success = 'Success'/*200-299*/,
  Redirect = 'Redirect'/*300-399*/,
  ClientError = 'ClientError'/*400-499*/,
  ServerError = 'ServerError'/*500-599*/,
}

export const getHttpMetaStatusCode = (statusCode: number) => {
  if((statusCode >= 100) && (statusCode <= 199)) return HttpMetaStatusCode.Information;
  if((statusCode >= 200) && (statusCode <= 299)) return HttpMetaStatusCode.Success;
  if((statusCode >= 300) && (statusCode <= 399)) return HttpMetaStatusCode.Redirect;
  if((statusCode >= 400) && (statusCode <= 499)) return HttpMetaStatusCode.ClientError;
  if((statusCode >= 500) && (statusCode <= 599)) return HttpMetaStatusCode.ServerError;
  throw createApplicationError('functions/invalid-argument', `Invalid HTTP Status Code (${statusCode}).`);
};
