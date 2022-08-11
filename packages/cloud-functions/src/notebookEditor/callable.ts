import * as functions from 'firebase-functions';

import { NotebookEditorDemoAsyncNodeExecute_Rest, NotebookEditorDemoAsyncNodeExecute_Rest_Schema, NotebookEditorInsertNumbers_Rest, NotebookEditorInsertNumbers_Rest_Schema, NotebookEditorInsertText_Rest, NotebookEditorInsertText_Rest_Schema } from '@ureeka-notebook/service-common';

import { wrapCall, SmallMemory } from '../util/function';
import { getDocument, updateDocument } from './api/api';
import { InsertText } from './api/text';
import { executeDemoAsyncNode } from './demoAsyncNode';

// ********************************************************************************
// == Example Document Update =====================================================
// inserts multiple numbers at random positions in the Notebook
export const notebookEditorInsertNumbers = functions.runWith(SmallMemory).https.onCall(wrapCall<NotebookEditorInsertNumbers_Rest>(
{ name: 'notebookEditorInsertNumbers', schema: NotebookEditorInsertNumbers_Rest_Schema, requiresAuth: true },
async (data, context, userId) => {
  const { versionIndex, document } = await getDocument(userId!/*auth'd*/, data.notebookId);
  // 10 (arbitrary) characters at random positions in the document
  const updates =
    Array.from({ length: 10 }, (_, i) => {
      const position = Math.floor(Math.random() * document.content.size) + 1/*start of valid content*/;
      return new InsertText(String(i), position, position);
    });

  await updateDocument(userId!/*auth'd*/, data.notebookId, updates, { versionIndex }/*constrain for example*/)/*throws on error*/;
}));

// inserts the given text at the start of the Notebook
export const notebookEditorInsertText = functions.runWith(SmallMemory).https.onCall(wrapCall<NotebookEditorInsertText_Rest>(
{ name: 'notebookEditorInsertText', schema: NotebookEditorInsertText_Rest_Schema, requiresAuth: true },
async (data, context, userId) => {
  await updateDocument(userId!/*auth'd*/, data.notebookId, [ new InsertText(data.text) ])/*throws on error*/;
}));

// == Demo Async Node =============================================================
export const notebookEditorDemoAsyncNodeExecute = functions.runWith(SmallMemory).https.onCall(wrapCall<NotebookEditorDemoAsyncNodeExecute_Rest>(
{ name: 'notebookEditorDemoAsyncNodeExecute', schema: NotebookEditorDemoAsyncNodeExecute_Rest_Schema, requiresAuth: true },
async (data, context, userId) => {
  await executeDemoAsyncNode(userId!/*auth'd*/, data.notebookId, data.nodeId, data.hashes, data.content)/*throws on error*/;
}));
