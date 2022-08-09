import { httpsCallable } from 'firebase/functions';

import { NotebookCreate_Rest, NotebookDelete_Rest, NotebookHashtag_Rest, NotebookIdentifier, NotebookPublish_Rest, NotebookShare_Rest } from '@ureeka-notebook/service-common';

import { functions } from '../util/firebase';
import { wrapHttpsCallable } from '../util/function';

// ** Auth'd User *****************************************************************
// == Notebook ====================================================================
export const notebookCreate = wrapHttpsCallable<NotebookCreate_Rest, NotebookIdentifier>(httpsCallable(functions, 'notebookCreate'));
export const notebookDelete = wrapHttpsCallable<NotebookDelete_Rest, NotebookIdentifier>(httpsCallable(functions, 'notebookDelete'));

// .. Hashtag .......................................................................
export const notebookHashtag = wrapHttpsCallable<NotebookHashtag_Rest>(httpsCallable(functions, 'notebookHashtag'));

// .. Share .......................................................................
export const notebookShare = wrapHttpsCallable<NotebookShare_Rest>(httpsCallable(functions, 'notebookShare'));

// .. Publish .....................................................................
export const notebookPublish = wrapHttpsCallable<NotebookPublish_Rest, NotebookIdentifier>(httpsCallable(functions, 'notebookPublish'));

// == Notebook Publish =============================================================
// SEE: #notebookPublish()
