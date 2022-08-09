import * as functions from 'firebase-functions';

import { NotebookEditorInsertText_Rest, NotebookEditorInsertText_Rest_Schema } from '@ureeka-notebook/service-common';

import { wrapCall, SmallMemory } from '../util/function';
import { insertText } from './command';

// ********************************************************************************
// == Session =====================================================================
// inserts the given text at the start of the Notebook.
export const notebookEditorInsertText = functions.runWith(SmallMemory).https.onCall(wrapCall<NotebookEditorInsertText_Rest>(
{ name: 'notebookEditorInsertText', schema: NotebookEditorInsertText_Rest_Schema, requiresAuth: true },
async (data, context, userId) => {
  await insertText(userId!/*auth'd*/, data.notebookId, data.text)/*throws on error*/;
}));
