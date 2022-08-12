import { createContext } from 'react';

import { Notebook, NotebookIdentifier } from '@ureeka-notebook/web-service';

// ********************************************************************************
// NotebookContext provides access to the current Notebook and its status to all
// descendants components
export type NotebookState = Readonly<{
  notebookId: NotebookIdentifier;
  notebook: Notebook;
}> | null/*not initialized or still loading*/;

export const NotebookContext = createContext<NotebookState>(null/*not initialized by default*/);
             NotebookContext.displayName = 'NotebookContext';
