import { Request } from 'firebase-functions/lib/providers/https';

import { isType, Identifier } from '@ureeka-notebook/service-common';

// collection of utility functions for Google Tasks
// ********************************************************************************

// ================================================================================
// Task Header Data (specific information included into Target Tasks request headers)
export type TaskIdentifier = Identifier;
export type TaskQueue = string/*alias*//*TODO: make enum*/;

// --------------------------------------------------------------------------------
export enum TaskHeaderDataEnum {
  taskId = 'taskId',
  queueName = 'queueName',

  taskETA = 'taskETA',
  taskExecutionCount = 'taskExecutionCount',
  retryCount = 'retryCount',
};

// Contains the parameters provided by Tasks
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

export const getTaskHeaderData = (req: Request) =>
  isType<TaskHeaderData>({
    taskId: req.headers[TaskHeaderDataStringMap[TaskHeaderDataEnum.taskId]] as string,
    retryCount: Number(req.headers[TaskHeaderDataStringMap[TaskHeaderDataEnum.retryCount]]),
    queueName: req.headers[TaskHeaderDataStringMap[TaskHeaderDataEnum.queueName]] as TaskQueue,
    taskExecutionCount: Number(req.headers[TaskHeaderDataStringMap[TaskHeaderDataEnum.taskExecutionCount]]),
    taskETA: Number(req.headers[TaskHeaderDataStringMap[TaskHeaderDataEnum.taskETA]]),
  });
