import { httpsCallable, HttpsCallable } from 'firebase/functions';
import log from 'loglevel';

import { decycle, isLocalDevelopment, isServiceLogger, removeNull, removeUndefined, ClientLog_Rest, LogLevel, LogView } from '@ureeka-notebook/service-common';

import { functions } from '../util/firebase';
import { getPackageVersion, Package, PackageVersion } from '../util/version';

// ********************************************************************************
// client (browser) logging is performed using https://github.com/pimterry/loglevel
// with a custom plugin (found in this file) for shipping the data off to a Cloud
// Function endpoint for dispatch to StackDriver Logging

// ================================================================================
let packageVersion: PackageVersion | undefined = undefined/*lazily loaded*/;

// --------------------------------------------------------------------------------
const mapLogLevel: { [name in LogLevel]: log.LogLevelNumbers } = {
  [LogLevel.TRACE]:  0/*log.LogLevel.TRACE*/,
  [LogLevel.DEBUG]:  1/*log.LogLevel.DEBUG*/,
  [LogLevel.INFO]:   2/*log.LogLevel.INFO*/,
  [LogLevel.WARN]:   3/*log.LogLevel.WARN*/,
  [LogLevel.ERROR]:  4/*log.LogLevel.ERROR*/,
  [LogLevel.SILENT]: 5/*log.LogLevel.SILENT*/,
};
export const mapLogLevelNumber: { [name in log.LogLevelNumbers]: LogLevel} = {
  [0/*log.LogLevel.TRACE*/]: LogLevel.TRACE,
  [1/*log.LogLevel.DEBUG*/]: LogLevel.DEBUG,
  [2/*log.LogLevel.INFO*/]: LogLevel.INFO,
  [3/*log.LogLevel.WARN*/]: LogLevel.WARN,
  [4/*log.LogLevel.ERROR*/]: LogLevel.ERROR,
  [5/*log.LogLevel.SILENT*/]: LogLevel.SILENT,
};
const DEFAULT_LOG_LEVEL = LogLevel.DEBUG/*by contract*/;

const DEFAULT_LOGGER_NAME = '_default_';

// ================================================================================
// NOTE: currently just augments what is logged with the log-level and logger name
export const configureLogging = () => {
  configureLogLevel();

  const originalFactory = log.methodFactory;
  log.methodFactory = (methodName, logLevelNumber, loggerNameSymbol) => {
    const originalMethod = originalFactory(methodName, logLevelNumber, loggerNameSymbol);
    const loggerName = !loggerNameSymbol
                       ? DEFAULT_LOGGER_NAME/*internal methods may not set a logger*/
                       : String(loggerNameSymbol)/*in case a Symbol is passed*/;

    return (...messages: any[]) => {
      // fire-and-forget the message to the server as long as this is not local-dev
      // and the LogLevel is above the LogLevelNumber (which is set on init)
      // NOTE: sending all of the local-dev DEBUG or TRACE messages to the server
      //       can create a bottleneck when developing
      const logLevel = methodName.toUpperCase() as LogLevel;
      if(!isLocalDevelopment() || (mapLogLevel[logLevel] > logLevelNumber)) {
        logServer(logLevel, loggerName, messages)
          .catch((error: any) => console.error(`Error writing log message to server. Reason: ${JSON.stringify(decycle(error))}`));
      } /* else -- limiting what's sent to the server */

      originalMethod(`[${methodName.toUpperCase()}:${loggerName}][${(new Date()).toLocaleTimeString()}]: ${messages.join('')}`);
    };
  };
};

// --------------------------------------------------------------------------------
// sets the root logger's log-level based on the environment var (if set)
const configureLogLevel = () => {
  let logLevelString = process.env.NEXT_PUBLIC_LOG_LEVEL || DEFAULT_LOG_LEVEL;
  if(mapLogLevel[logLevelString] === undefined) {
    console.warn(`Unknown log level ${logLevelString}. Defaulting to ${DEFAULT_LOG_LEVEL}.`);
    logLevelString = DEFAULT_LOG_LEVEL;
  } /* else -- the log-level string is known */

  // CHECK: it seems that a log level is being already set somewhere and this
  ///       has no effect!
  //log.setDefaultLevel(logLevelString as log.LogLevelDesc);
  log.setLevel(logLevelString as log.LogLevelDesc);
  // Explicitely log to the console
  // eslint-disable-next-line no-console
  console.info(`Setting default log level to ${logLevelString} `);
};

// == Server Logging ==============================================================
// NOTE: explicitly *NOT* wrapped as the wrapper may call the logger which, in the
//       case of an error from calling 'loggingClient', might cause an infinite loop
let loggingClient: HttpsCallable<ClientLog_Rest> | undefined = undefined/*lazily loaded*/;

const logServer = async (logLevel: LogLevel, logName: string, messages: any[]) => {
  if(packageVersion === undefined) packageVersion = getPackageVersion()/*lazily loaded*/;
  if(loggingClient === undefined) loggingClient = /*NOT WRAPPED*/httpsCallable(functions, 'loggingClient')/*lazily loaded*/;

  // TODO: decide if both a package-based version and an overall version should be
  //       recorded or not. As it stands, it's confusing in the data to see both
  //       point releases (from 'web') and '.0's (from services) getting logged
  const packageName = isServiceLogger(logName) ? Package.ServiceCommon : Package.Web;
  const version = packageVersion.packages[packageName];

  const message = await getContent(messages, logLevel);
  const context = await getContext();

  // TODO: send to server (with back-off if server cannot be reached)
  const content: ClientLog_Rest = {
    logName,
    severity: logLevel as LogLevel,
    view: LogView.Message/*default to Message view (rather than HTTP request view) for all logs*/,

    message,

    httpRequest: {
      method: 'POST'/*FIXME: get from some context*/,
      url: window.location.href,
      userAgent: window.navigator.userAgent,
    },

    context,

    source: {
      service: packageName,
      version,

      gitBranch: packageVersion.branch,
      gitVersion: packageVersion.hash,

      file: null/*stack frames not currently supported*/,
      line: null/*stack frames not currently supported*/,
      'function': null/*stack frames not currently supported*/,
    },

    timestamp: new Date().toISOString()/*now*/,
  };
  try {
    await loggingClient(removeNull(removeUndefined(content)) as ClientLog_Rest/*since Partial<T> is too loose in this context*/);
  } catch(error) {
    // TODO: error.code === 'internal' when the server cannot be reached. Queue
    //       these messages for later re-delivery?
    console.error(`Could not log message to server (${JSON.stringify(content)}). Reason`, error);
  }
};

// -- Content ---------------------------------------------------------------------
// TODO: handle concat'ing of message text better!
const getContent = async (messages: any[], logLevel: LogLevel) => messages.join('');

// -- Context ---------------------------------------------------------------------
// if the user is not logged in then the context is undefined
const getContext = async () => {
  // NOTE: this is retrieved asynchronously so that there are no top-level
  //       dependencies on AuthUserService (which will cause circular reference
  //       problems)
  const { AuthUserService } = await import('../authUser/service');

  const authUser = AuthUserService.getInstance().getAuthUser();
  return authUser;
};
