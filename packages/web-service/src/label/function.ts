import { httpsCallable } from 'firebase/functions';

import { LabelCreate_Rest, LabelDelete_Rest, LabelIdentifier, LabelNotebookAdd_Rest, LabelNotebookRemove_Rest, LabelNotebookReorder_Rest, LabelShare_Rest, LabelUpdate_Rest, NotebookIdentifier } from '@ureeka-notebook/service-common';

import { functions } from '../util/firebase';
import { wrapHttpsCallable } from '../util/function';

// ** Auth'd User *****************************************************************
// == Label =======================================================================
export const labelCreate = wrapHttpsCallable<LabelCreate_Rest, LabelIdentifier>(httpsCallable(functions, 'labelCreate'));
export const labelUpdate = wrapHttpsCallable<LabelUpdate_Rest>(httpsCallable(functions, 'labelUpdate'));
export const labelDelete = wrapHttpsCallable<LabelDelete_Rest>(httpsCallable(functions, 'labelDelete'));

// -- Notebook --------------------------------------------------------------------
export const labelNotebookAdd = wrapHttpsCallable<LabelNotebookAdd_Rest>(httpsCallable(functions, 'labelNotebookAdd'));
export const labelNotebookRemove = wrapHttpsCallable<LabelNotebookRemove_Rest>(httpsCallable(functions, 'labelNotebookRemove'));

export const labelNotebookReorder = wrapHttpsCallable<LabelNotebookReorder_Rest, NotebookIdentifier[]>(httpsCallable(functions, 'labelNotebookReorder'));

// -- Share -----------------------------------------------------------------------
export const labelShare = wrapHttpsCallable<LabelShare_Rest>(httpsCallable(functions, 'labelShare'));
