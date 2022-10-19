import { Logging } from '@google-cloud/logging';
import { LogEntry, LogSeverity } from '@google-cloud/logging/build/src/entry';
import { CallableContext } from 'firebase-functions/lib/common/providers/https';

import { camelToKebabCase, generateUuid, LogLevel, LogView } from '@ureeka-notebook/service-common';

import { getEnv, FUNCTION_REGION, PROJECT_ID } from '../util/environment';
import { ReportedError } from './type';
import { toStackdriverTimestamp } from './util';

// ********************************************************************************
const LOGLEVEL_TO_LOGSEVERITY: Map<LogLevel, LogSeverity> = new Map([
  // CHECK: there seems to be no way to get at the underlying enum (defined in the
  //        logging protobufs)
  // REF: https://cloud.google.com/logging/docs/reference/v2/rest/v2/LogEntry#logseverity
  [ LogLevel.TRACE, 100/*DEBUG*/ ],
  [ LogLevel.DEBUG, 100/*DEBUG*/ ],
  [ LogLevel.INFO, 200/*INFO*/ ],
  [ LogLevel.WARN, 400/*WARNING*/ ],
  [ LogLevel.ERROR, 500/*ERROR*/ ],
  [ LogLevel.SILENT, 0/*DEFAULT (but will be culled)*/ ],
]);

// --------------------------------------------------------------------------------
const reportedErrorLogName = (loggerName: string) => `projects/${PROJECT_ID}/logs/${encodeURIComponent(loggerName)}`;
const customLogName = (loggerName: string) => `projects/${PROJECT_ID}/logs/${encodeURIComponent(loggerName)}`;

// == Local Types =================================================================
type JsonLogEntry = Readonly<{
  metadata: LogEntry;
  jsonPayload: object;
}>;

// == Function Invocation =========================================================
// 'loggerName' and 'functionName' correspond to the respective fields in StackDriver's
// Log Viewer for 'Cloud Function'
// NOTE: if 'data' (specifically as a JavaScript object *not* a string) contains a
//       'message' property then it will be used as the primary message in
//       StackDriver's Log Viewer otherwise the specified JSON will be string'ifed
//       and used as the message
// CHECK: how to get the function name *without* explicitly specifying it (which
//        is extremely error prone)?
export const logFunctionInvocation = async (functionName: string, data: object, context?: CallableContext) => {
  const logName = camelToKebabCase(functionName);
  const severity = LOGLEVEL_TO_LOGSEVERITY.get(LogLevel.INFO)!;

  // REF: https://firebase.google.com/docs/functions/writing-and-viewing-logs#custom_stackdriver_logs
  // REF: https://cloud.google.com/logging/docs/reference/v2/rest/v2/LogEntry
  const metadata: LogEntry = {
    labels: {
      source: 'function_invocation'/*so that all function invocations can be identified*/,
      version: String(getEnv('VERSION'))/*so there's something to select on as functions change*/,
      build_date: String(getEnv('BUILD_DATE'))/*ditto*/,
    },
    // NOTE: 'logName' is used in StackDriver Sinks to define the resulting GCS path
    logName: customLogName(logName),
    resource: {
      type: 'cloud_function'/*group with Cloud Functions (since that's where it's being logged from)*/,
      labels: {
        'function_name': functionName,
        'project_id': PROJECT_ID,
        'region': FUNCTION_REGION,
        'instance_id': generateUuid()/*unique -per- -invocation-*/,
      },
    },
    // NOTE: the time will be defaulted to the time that the log was posted
    severity,
  };
  const jsonPayload = {
    context: {
      userId: context?.auth?.uid/*by Application contract, if there is auth then there is a user*/,
      // CHECK: should this include version information ala 'sourceReferences'?
    },
    data,
  };
  await logJson(logName, [{ metadata, jsonPayload }]);
};

// == Reported Error ==============================================================
// each ReportedError is unique -per- -invocation- (even if called multiple times
// in the same Cloud Function)
export const logReportedError = async (reportedError: ReportedError) => {
  const loggerName = reportedError.logName/*for convenience*/;
  const severity = LOGLEVEL_TO_LOGSEVERITY.get(reportedError.severity);
  const message = reportedError.message/*for convenience*/;

  // NOTE: this populates the main content in Stackdriver Logging's "Logs Viewer"
  //       as a HTTP Request
  // REF: https://cloud.google.com/logging/docs/reference/v2/rest/v2/LogEntry#HttpRequest
  const httpRequest = (reportedError.view === LogView.HttpRequest) ?
    {
      requestMethod: reportedError.httpRequest.method,
      requestUrl: reportedError.httpRequest.url,
      userAgent: reportedError.httpRequest.userAgent,
      // NOTE: 'responseSize' and 'latency' are shown in the Stackdriver "Logs Viewer"
    } : undefined/*default (and Message) to none*/;

  // NOTE: this does *not* work if put into the LogEntry. It only works as the 'data'
  //       parameter to Log.entry()
  const jsonPayload = {
    // REF: https://cloud.google.com/error-reporting/reference/rest/v1beta1/ErrorContext
    '@type': 'type.googleapis.com/google.devtools.clouderrorreporting.v1beta1.ReportedErrorEvent',

    // REF: https://cloud.google.com/error-reporting/reference/rest/v1beta1/ServiceContext
    serviceContext: {
      service: reportedError.source.service,
      version: reportedError.source.version,
    },
    message,

    // REF: https://cloud.google.com/error-reporting/docs/formatting-error-messages
    // REF: https://cloud.google.com/error-reporting/docs/formatting-error-messages#json_representation
    context: {
      httpRequest: {
        method: reportedError.httpRequest.method,
        url: reportedError.httpRequest.url,
        userAgent: reportedError.httpRequest.userAgent,
      },
      user: reportedError.context && reportedError.context.userId,
      sessionId: reportedError.context && reportedError.context.sessionId,
      // TODO: decide if this should be omitted if there is no 'source' info
      reportLocation: {
        filePath: reportedError.source.file,
        lineNumber: reportedError.source.line,
        functionName: reportedError.source.function,
      },
      sourceReferences: {
        repository: reportedError.source.gitBranch,
        revisionId: reportedError.source.gitVersion,
      },
    },
  };

  // REF: https://cloud.google.com/logging/docs/reference/v2/rest/v2/LogEntry
  const metadata: LogEntry = {
    logName: reportedErrorLogName(loggerName),
    resource: {
      type: 'reported_errors',
      labels: {
        'project_id': PROJECT_ID,
        'region': FUNCTION_REGION,
        'instance_id': generateUuid()/*unique -per- -invocation-*/,
      },
    },

    httpRequest,

    // TODO: decide if this should be omitted if there is no 'source' info
    // REF: https://cloud.google.com/logging/docs/reference/v2/rest/v2/LogEntry#LogEntrySourceLocation
    sourceLocation: {
      file: reportedError.source.file,
      line: reportedError.source.line,
      'function': reportedError.source.function,
    },

    // 'timestamp' is what the logs are ordered by so use the client's time so
    // that latency doesn't affect the order making debugging impossible
    timestamp: toStackdriverTimestamp(new Date(reportedError.timestamp)),
    receiveTimestamp: toStackdriverTimestamp(new Date()/*now*/),
    severity,
  };
  await logJson(loggerName, [{ metadata, jsonPayload }]);
};

// --------------------------------------------------------------------------------
// NOTE: if 'json' (specifically as a JavaScript object *not* a string) contains a
//       'message' property then it will be used as the primary message in
//       StackDriver's Log Viewer otherwise the specified JSON will be string'ifed
//       and used as the message
const logJson = async (loggerName: string, jsonLogEntries: JsonLogEntry[]) => {
  const logging = new Logging({ projectId: PROJECT_ID });
  const log = logging.log(loggerName);

  // NOTE: this must have *BOTH* metadata and data (determined via T&E) for
  //       anything to be reported in Stackdriver's 'Reported Errors'
  const entries = jsonLogEntries.map(entry => log.entry(entry.metadata, entry.jsonPayload));
  try {
    await log.write(entries);
  } catch(error) {
    console.error(`Error writing to Stackdriver Logging. (Original entry(ies) follow.) Reason: `, error);
    console.error(JSON.stringify(entries));
  }
};
