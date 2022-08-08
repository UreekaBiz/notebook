import * as functions from 'firebase-functions';

import { isBlank, NotebookCreate_Rest, NotebookCreate_Rest_Schema, NotebookDelete_Rest, NotebookDelete_Rest_Schema, NotebookIdentifier, NotebookPublish_Rest, NotebookPublish_Rest_Schema, NotebookShare_Rest, NotebookShare_Rest_Schema } from '@ureeka-notebook/service-common';

import { wrapCall } from '../util/function';
import { createNotebook, deleteNotebook } from './notebook';
import { publishNotebook } from './publish';
import { shareNotebook } from './share';

// ********************************************************************************
// == Notebook ====================================================================
export const notebookCreate = functions.https.onCall(wrapCall<NotebookCreate_Rest, NotebookIdentifier>(
{ name: 'notebookCreate', schema: NotebookCreate_Rest_Schema, convertNullToUndefined: true, requiresAuth: true },
async (data, context, userId) => {
  return await createNotebook(userId!/*auth'd*/, data.type, data.name);
}));

// ................................................................................
export const notebookDelete = functions.https.onCall(wrapCall<NotebookDelete_Rest>(
{ name: 'notebookDelete', schema: NotebookDelete_Rest_Schema, convertNullToUndefined: true, requiresAuth: true },
async (data, context, userId) => {
  await deleteNotebook(userId!/*auth'd*/, data.notebookId);
}));

// -- Share -----------------------------------------------------------------------
export const notebookShare = functions.https.onCall(wrapCall<NotebookShare_Rest>(
{ name: 'notebookShare', schema: NotebookShare_Rest_Schema, convertNullToUndefined: true, requiresAuth: true },
async (data, context, userId) => {
  const share = new Map(Object.entries(data.userRoles/*object*/).filter(([userId]) => !isBlank(userId)))/*convert back to Map*/;
  await shareNotebook(userId!/*auth'd*/, data.notebookId, share);
}));

// -- Publish ---------------------------------------------------------------------
export const notebookPublish = functions.https.onCall(wrapCall<NotebookPublish_Rest, NotebookIdentifier>(
{ name: 'notebookPublish', schema: NotebookPublish_Rest_Schema, convertNullToUndefined: true, requiresAuth: true },
async (data, context, userId) => {
  return await publishNotebook(userId!/*auth'd*/, data.notebookId, data.versionIndex, data.title, data.image, data.snippet);
}));
