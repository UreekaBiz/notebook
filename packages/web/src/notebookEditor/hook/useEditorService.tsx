import { useContext } from 'react';

import { NotebookEditorContext } from 'notebookEditor/context/NotebookEditorContext';

// ********************************************************************************
export const useEditorService = () => {
  const context = useContext(NotebookEditorContext);
  if(!context) throw new Error(`useEditorService hook must be used within a ${NotebookEditorContext.displayName} context or that context was not initialized.`);

  return context;
};
