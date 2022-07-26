import { httpsCallable } from 'firebase/functions';

import { NotebookEditorDemo2AsyncNodeExecute_Rest, NotebookEditorDemoAsyncNodeExecute_Rest } from '@ureeka-notebook/service-common';

import { functions } from '../util/firebase';
import { wrapHttpsCallable } from '../util/function';

// ** Auth'd User *****************************************************************
// == Notebook Editor =============================================================
export const notebookEditorDemoAsyncNodeExecute = wrapHttpsCallable<NotebookEditorDemoAsyncNodeExecute_Rest>(httpsCallable(functions, 'notebookEditorDemoAsyncNodeExecute'));
export const notebookEditorDemo2AsyncNodeExecute = wrapHttpsCallable<NotebookEditorDemo2AsyncNodeExecute_Rest>(httpsCallable(functions, 'notebookEditorDemo2AsyncNodeExecute'));
