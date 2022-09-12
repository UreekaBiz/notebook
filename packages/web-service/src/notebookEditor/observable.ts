import { NotebookIdentifier, NotebookUsers } from '@ureeka-notebook/service-common';

import { object } from '../util/observableObject';
import { defaultObjectConverter } from '../util/observableRtdb';
import { notebookUsersRef } from './datastore';

// ********************************************************************************
// == Notebook Collaboration ======================================================
export const notebookUsers$ = (notebookId: NotebookIdentifier) =>
  object(notebookUsersRef(notebookId), defaultObjectConverter<NotebookUsers>);
