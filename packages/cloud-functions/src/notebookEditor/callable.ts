import * as functions from 'firebase-functions';

import { NotebookEditorDemo2AsyncNodeExecute_Rest, NotebookEditorDemo2AsyncNodeExecute_Rest_Schema, NotebookEditorDemoAsyncNodeExecute_Rest, NotebookEditorDemoAsyncNodeExecute_Rest_Schema } from '@ureeka-notebook/service-common';

import { wrapCall, SmallMemory } from '../util/function';
import { executeDemo2AsyncNode } from './demo2AsyncNode';
import { executeDemoAsyncNode } from './demoAsyncNode';

// ********************************************************************************
// == Demo Async Node =============================================================
export const notebookEditorDemoAsyncNodeExecute = functions.runWith(SmallMemory).https.onCall(wrapCall<NotebookEditorDemoAsyncNodeExecute_Rest>(
{ name: 'notebookEditorDemoAsyncNodeExecute', schema: NotebookEditorDemoAsyncNodeExecute_Rest_Schema, requiresAuth: true },
async (data, context, userId) => {
  await executeDemoAsyncNode(userId!/*auth'd*/, data.notebookId, data.nodeId, data.hashes, data.content)/*throws on error*/;
}));

// == Demo 2 Async Node =============================================================
export const notebookEditorDemo2AsyncNodeExecute = functions.runWith(SmallMemory).https.onCall(wrapCall<NotebookEditorDemo2AsyncNodeExecute_Rest>(
{ name: 'notebookEditorDemo2AsyncNodeExecute', schema: NotebookEditorDemo2AsyncNodeExecute_Rest_Schema, requiresAuth: true },
async (data, context, userId) => {
  await executeDemo2AsyncNode(userId!/*auth'd*/, data.notebookId, data.nodeId, data.content, data.replace)/*throws on error*/;
}));
