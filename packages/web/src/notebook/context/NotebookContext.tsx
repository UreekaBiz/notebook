import { createContext } from 'react';

import { Notebook, NotebookIdentifier } from '@ureeka-notebook/web-service';
import { AsyncStatus } from 'shared/hook';

// ********************************************************************************
// NotebookContext provides access to the current Notebook and its status to all
// descendants components.
export type NotebookState = Readonly<{
  notebookId: NotebookIdentifier;
  notebook: Notebook | null/*not found or not loaded yet*/;

  status: AsyncStatus/*status of the subscription to the given notebook*/;
}> | null/*not initialized*/;

export const NotebookContext = createContext<NotebookState>(null/*not initialized by default*/);
             NotebookContext.displayName = 'NotebookContext';
