import * as functions from 'firebase-functions';

import { NotebookEditorInsertNumbers_Rest, NotebookEditorInsertNumbers_Rest_Schema, NotebookEditorInsertText_Rest, NotebookEditorInsertText_Rest_Schema } from '@ureeka-notebook/service-common';

import { wrapCall, SmallMemory } from '../util/function';
import { insertNumbers, insertText, wrapCommandFunction } from './command';

// ********************************************************************************
// == Session =====================================================================
// inserts multiple numbers at random positions in the Notebook
export const notebookEditorInsertNumbers = functions.runWith(SmallMemory).https.onCall(wrapCall<NotebookEditorInsertNumbers_Rest>(
{ name: 'notebookEditorInsertNumbers', schema: NotebookEditorInsertNumbers_Rest_Schema, requiresAuth: true },
async (data, context, userId) => {
  await wrapCommandFunction(userId!/*auth'd*/, data.notebookId, 'insertNumbers', insertNumbers())/*throws on error*/;
}));

// inserts the given text at the start of the Notebook
export const notebookEditorInsertText = functions.runWith(SmallMemory).https.onCall(wrapCall<NotebookEditorInsertText_Rest>(
{ name: 'notebookEditorInsertText', schema: NotebookEditorInsertText_Rest_Schema, requiresAuth: true },
async (data, context, userId) => {
  await wrapCommandFunction(userId!/*auth'd*/, data.notebookId, 'insertText', insertText(data.text))/*throws on error*/;
}));
