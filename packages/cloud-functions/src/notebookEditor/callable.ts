import * as functions from 'firebase-functions';

import { NotebookEditorInsertText_Rest, NotebookEditorInsertText_Rest_Schema } from '@ureeka-notebook/service-common';

import { wrapCall, SmallMemory } from '../util/function';
import { insertText } from './commands';

// ********************************************************************************
// == Session =====================================================================
// clears the specified User-Session
export const notebookEditorInsertText = functions.runWith(SmallMemory).https.onCall(wrapCall<NotebookEditorInsertText_Rest>(
{ name: 'authUserSessionClear', schema: NotebookEditorInsertText_Rest_Schema, requiresAuth: true },
async (data, context, userId) => {
  await insertText(userId!/*auth'd*/, data.notebookId, data.text)/*throws on error*/;
}));
