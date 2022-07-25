import { useContext } from 'react';

import { NotebookContext } from 'notebook/context/NotebookContext';

// ********************************************************************************
export const useNotebook = () => {
  const context = useContext(NotebookContext);
  if(!context) throw new Error(`useNotebook hook must be used within a ${NotebookContext.displayName} context or that context was not initialized.`);

  return context;
};
