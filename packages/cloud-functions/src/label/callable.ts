import * as functions from 'firebase-functions';

import { isBlank, LabelCreate_Rest, LabelCreate_Rest_Schema, LabelDelete_Rest, LabelDelete_Rest_Schema, LabelIdentifier, LabelNotebookAdd_Rest, LabelNotebookAdd_Rest_Schema, LabelNotebookRemove_Rest, LabelNotebookRemove_Rest_Schema, LabelNotebookReorder_Rest, LabelNotebookReorder_Rest_Schema, LabelShare_Rest, LabelShare_Rest_Schema, LabelUpdate_Rest, LabelUpdate_Rest_Schema, NotebookIdentifier } from '@ureeka-notebook/service-common';

import { wrapCall } from '../util/function';
import { createLabel, deleteLabel, updateLabel } from './label';
import { addNotebook, removeNotebook, reorderNotebooks } from './labelNotebook';
import { shareLabel } from './share';

// ********************************************************************************
// == Label ====================================================================
export const labelCreate = functions.https.onCall(wrapCall<LabelCreate_Rest, LabelIdentifier>(
{ name: 'labelCreate', schema: LabelCreate_Rest_Schema, convertNullToUndefined: true, requiresAuth: true },
async (data, context, userId) => {
  return await createLabel(userId!/*auth'd*/, data.name, data.visibility, data.ordered);
}));

// ................................................................................
export const labelUpdate = functions.https.onCall(wrapCall<LabelUpdate_Rest>(
{ name: 'labelUpdate', schema: LabelUpdate_Rest_Schema, convertNullToUndefined: true, requiresAuth: true },
async (data, context, userId) => {
  await updateLabel(userId!/*auth'd*/, data.labelId, data.name, data.visibility, data.ordered);
}));

// ................................................................................
export const labelDelete = functions.https.onCall(wrapCall<LabelDelete_Rest>(
{ name: 'labelDelete', schema: LabelDelete_Rest_Schema, convertNullToUndefined: true, requiresAuth: true },
async (data, context, userId) => {
  await deleteLabel(userId!/*auth'd*/, data.labelId);
}));

// -- Share -----------------------------------------------------------------------
export const labelShare = functions.https.onCall(wrapCall<LabelShare_Rest>(
{ name: 'labelShare', schema: LabelShare_Rest_Schema, convertNullToUndefined: true, requiresAuth: true },
async (data, context, userId) => {
  const share = new Map(Object.entries(data.userRoles/*object*/).filter(([userId]) => !isBlank(userId)))/*convert back to Map*/;
  await shareLabel(userId!/*auth'd*/, data.labelId, share);
}));

// -- Notebook --------------------------------------------------------------------
export const labelNotebookAdd = functions.https.onCall(wrapCall<LabelNotebookAdd_Rest>(
{ name: 'labelNotebookAdd', schema: LabelNotebookAdd_Rest_Schema, convertNullToUndefined: true, requiresAuth: true },
async (data, context, userId) => {
  await addNotebook(userId!/*auth'd*/, data.labelId, data.notebookId);
}));

// ................................................................................
export const labelNotebookRemove = functions.https.onCall(wrapCall<LabelNotebookRemove_Rest>(
{ name: 'labelNotebookRemove', schema: LabelNotebookRemove_Rest_Schema, convertNullToUndefined: true, requiresAuth: true },
async (data, context, userId) => {
  await removeNotebook(userId!/*auth'd*/, data.labelId, data.notebookId);
}));

// ................................................................................
export const labelNotebookReorder = functions.https.onCall(wrapCall<LabelNotebookReorder_Rest, NotebookIdentifier[]>(
{ name: 'labelNotebookReorder', schema: LabelNotebookReorder_Rest_Schema, convertNullToUndefined: true, requiresAuth: true },
async (data, context, userId) => {
  return await reorderNotebooks(userId!/*auth'd*/, data.labelId, data.order);
}));
