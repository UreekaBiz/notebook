import { CloudTasksClient } from '@google-cloud/tasks';
import { google } from '@google-cloud/tasks/build/protos/protos';
import Bottleneck from 'bottleneck';
import { logger } from 'firebase-functions';
import { Request } from 'firebase-functions/lib/providers/https';

import { Identifier } from '@ureeka-notebook/service-common';

import { FUNCTION_REGION, PROJECT_ID, SERVICE_ACCOUNT_EMAIL } from '../environment';
import { TimestampFromDate } from '../firestore';

// collection of utility functions for Google Tasks
// ********************************************************************************
 // NOTE: the value must match that used in `gcloud tasks queues create <queue-name>`
export enum TaskQueue {
  BatchDispatchNotification = 'BatchDispatchNotification',
  DispatchNotification = 'DispatchNotification',

  SystemMaintenance = 'SystemMaintenance',
}

// ********************************************************************************
export type TaskIdentifier = Identifier;

export type TaskDefinition<T/*must be JSON.stringify()'able*/> = Readonly<{
  /** the Task Queue into which the Task is enqueued */
  taskQueue: TaskQueue;
  /** the name of the HTTPS Cloud-Function that is called as the target */
  targetFunctionName: string;

  taskId?: string/*optional taskId for dedup'ing*/;
  taskBody: T;

  // if not specified then it is executed immediately
  // TODO: move this to some form of Timestamp to better match with ITask's ITimestamp
  scheduleDateTime?: Date;
}>;

// ================================================================================
// REF: https://cloud.google.com/tasks/docs/reference/rpc/google.cloud.tasks.v2#createtaskrequest
// REF: https://cloud.google.com/tasks/docs/reference/rest/v2/projects.locations.queues.tasks
const generateTaskName = (taskQueue: TaskQueue, taskId: string) =>
  `projects/${PROJECT_ID}/locations/${FUNCTION_REGION}/queues/${taskQueue}/tasks/${taskId}`;
const generateTaskUrl = <T>(taskDefinition: TaskDefinition<T>) =>
  `https://${FUNCTION_REGION}-${PROJECT_ID}.cloudfunctions.net/${taskDefinition.targetFunctionName}`;

// ================================================================================
// this is to support a local queue which is a work-around to:
//    https://github.com/googleapis/nodejs-tasks/issues/397
// TODO: move to .env configuration parameter! (per queue?)
const limiter = new Bottleneck({
  // REF: https://github.com/SGrondin/bottleneck
  minTime: Math.floor(1000/*ms/s*/ / 50/*# of requests*/),
  maxConcurrent: 50/*at most running at a time*/,
});

// ................................................................................
// NOTE: schedule date cannot be more than 30d in the future
export const enqueueTask = async <T>(taskDefinition: TaskDefinition<T>): Promise<string/*taskName*/ | undefined/*failed*/> => {
  logger.info(`Enqueuing task:`, JSON.stringify(taskDefinition));
  const taskName = (taskDefinition.taskId === undefined)
                    ? undefined/*'name' will be unspecified (so not dedup'd by name)*/
                    : { name: generateTaskName(taskDefinition.taskQueue, taskDefinition.taskId) };
  const time = (taskDefinition.scheduleDateTime === undefined)
                ? undefined/*'scheduleTime' will be unspecified (which means 'immediately')*/
                : { scheduleTime: TimestampFromDate(taskDefinition.scheduleDateTime)/*same struct as ITimestamp*/ };

  // REF: https://cloud.google.com/tasks/docs/reference/rest/v2/projects.locations.queues.tasks
  // REF: https://github.com/googleapis/nodejs-tasks/issues/334
  const body = Buffer.from(JSON.stringify(taskDefinition.taskBody)).toString('base64') as any/*SEE: REF above*/;
  const task: google.cloud.tasks.v2.ITask = {
    ...taskName,
    httpRequest: {
      httpMethod: google.cloud.tasks.v2.HttpMethod.POST,
      url: generateTaskUrl(taskDefinition),
      oidcToken: {
        serviceAccountEmail: SERVICE_ACCOUNT_EMAIL,
      },
      headers: {
        'Content-Type': 'application/json',
      },
      body,
    },
    ...time,
  };

  try {
    // TODO: make limiter *per* *queue*
    // CHECK: will the issue below get triggered across queues or only per queue?)
    // NOTE: this queue (limiter) around the queue is a work-around for:
    //       https://github.com/googleapis/nodejs-tasks/issues/397
    const client = new CloudTasksClient(),
          parent = client.queuePath(PROJECT_ID, FUNCTION_REGION, taskDefinition.taskQueue);
    const [response] = await limiter.schedule(() => client.createTask({ parent, task }));
    if(!response.name) logger.warn(`Creating task did not return a task name as expected.`, JSON.stringify(response));
    return response.name as string/*taskName*/;
  } catch(error) {
    logger.error(`Could not enqueue task to queue (${JSON.stringify(taskDefinition)}). Reason: `, error);
    return undefined/*failed (by contract)*/;
  }
};

// --------------------------------------------------------------------------------
export const deleteTask = async (taskName: string) => {
  const client = new CloudTasksClient();
  try {
    const task: google.cloud.tasks.v2.IDeleteTaskRequest = {
      name: taskName,
    };
    await client.deleteTask(task);
  } catch(error) {
    logger.error('task/dequeue', `Error deleting task (${taskName}). Reason: `, error);
  }
};

// == Task Header =================================================================
// Task Header Data (specific information included into Target Tasks request headers)

export enum TaskHeaderDataEnum {
  taskId = 'taskId',
  queueName = 'queueName',

  taskETA = 'taskETA',
  taskExecutionCount = 'taskExecutionCount',
  retryCount = 'retryCount',
};

// contains the parameters provided by Tasks
export type TaskHeaderData = {
  [TaskHeaderDataEnum.taskId]: TaskIdentifier/*task name (generated automatically if is not specified at the moment of creation of the task)*/;
  [TaskHeaderDataEnum.queueName]: TaskQueue/*name of the queue which dispatched the task*/;

  [TaskHeaderDataEnum.taskETA]: number/*scheduled time of the task, specified in seconds*/;
  [TaskHeaderDataEnum.taskExecutionCount]: number/*total number of times the task has received a response (not 5XX errors)*/;
  [TaskHeaderDataEnum.retryCount]: number/*number of time the task has been retried*/;
};

export const TaskHeaderDataStringMap: Record<TaskHeaderDataEnum, string> = {
  [TaskHeaderDataEnum.taskId]: 'x-cloudtasks-taskname',
  [TaskHeaderDataEnum.queueName]: 'x-cloudtasks-queuename',

  [TaskHeaderDataEnum.taskETA]: 'x-cloudtasks-tasketa',
  [TaskHeaderDataEnum.taskExecutionCount]: 'x-cloudtasks-taskexecutioncount',
  [TaskHeaderDataEnum.retryCount]: 'x-cloudtasks-taskretrycount',
};

export const getTaskHeaderData = (req: Request): TaskHeaderData =>
  ({
    taskId: req.headers[TaskHeaderDataStringMap[TaskHeaderDataEnum.taskId]] as string,
    retryCount: Number(req.headers[TaskHeaderDataStringMap[TaskHeaderDataEnum.retryCount]]),
    queueName: req.headers[TaskHeaderDataStringMap[TaskHeaderDataEnum.queueName]] as TaskQueue,
    taskExecutionCount: Number(req.headers[TaskHeaderDataStringMap[TaskHeaderDataEnum.taskExecutionCount]]),
    taskETA: Number(req.headers[TaskHeaderDataStringMap[TaskHeaderDataEnum.taskETA]]),
  });
