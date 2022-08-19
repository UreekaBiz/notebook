// ********************************************************************************
export enum LogLevel {
  TRACE = 'TRACE',
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  SILENT = 'SILENT',
}

// --------------------------------------------------------------------------------
export const isServiceLogger = (logger: ServiceLogger | Logger | string/*log-level mashes down to string*/) => /^service\./.test(logger);

// all known named Loggers (centralized for sanity and ease-to-find)
export enum ServiceLogger {
  DEFAULT = 'service.default'/*for generic cases*/,

  ASSET = 'service.asset',
  AUTH_USER = 'service.auth_user',
  HASHTAG = 'service.hashtag',
  LABEL = 'service.label',
  NOTEBOOK = 'service.notebook',
  NOTEBOOK_EDITOR = 'service.notebook_editor'/*separate since can be very noisy*/,
  USER = 'service.user',
  UTIL = 'service.util',
}

export enum Logger {
  DEFAULT = 'default'/*for generic cases*/,

  AUTH_USER = 'auth_user',
  NOTEBOOK = 'notebook',
  USER = 'user',
  UTIL = 'util',
}
