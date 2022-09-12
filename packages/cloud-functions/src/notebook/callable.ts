import * as functions from 'firebase-functions';

import { isBlank, normalizeHashtag, NotebookCopy_Rest, NotebookCopy_Rest_Schema, NotebookCreate_Rest, NotebookCreate_Rest_Schema, NotebookDelete_Rest, NotebookDelete_Rest_Schema, NotebookHashtag_Rest, NotebookHashtag_Rest_Schema, NotebookIdentifier, NotebookPublish_Rest, NotebookPublish_Rest_Schema, NotebookShare_Rest, NotebookShare_Rest_Schema } from '@ureeka-notebook/service-common';

import { wrapCall } from '../util/function';
import { copyNotebook, createNotebook, deleteNotebook, hashtagNotebook } from './notebook';
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
export const notebookCopy = functions.https.onCall(wrapCall<NotebookCopy_Rest, NotebookIdentifier>(
{ name: 'notebookCopy', schema: NotebookCopy_Rest_Schema, convertNullToUndefined: true, requiresAuth: true },
async (data, context, userId) => {
  return await copyNotebook(userId!/*auth'd*/, data.notebookId);
}));

// ................................................................................
export const notebookDelete = functions.https.onCall(wrapCall<NotebookDelete_Rest>(
{ name: 'notebookDelete', schema: NotebookDelete_Rest_Schema, convertNullToUndefined: true, requiresAuth: true },
async (data, context, userId) => {
  await deleteNotebook(userId!/*auth'd*/, data.notebookId);
}));

// -- Hashtag ---------------------------------------------------------------------
export const notebookHashtag = functions.https.onCall(wrapCall<NotebookHashtag_Rest>(
{ name: 'notebookHashtag', schema: NotebookHashtag_Rest_Schema, convertNullToUndefined: true, requiresAuth: true },
async (data, context, userId) => {
  const hashtags = new Set(data.hashtags
                                .map(hashtag => normalizeHashtag(hashtag))/*normalize by contract*/
                                .filter(hashtag => !isBlank(hashtag))/*sanity*/);
  await hashtagNotebook(userId!/*auth'd*/, data.notebookId, hashtags);
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
