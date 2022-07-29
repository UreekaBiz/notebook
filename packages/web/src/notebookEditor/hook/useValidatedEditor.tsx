import { Editor } from '@tiptap/react';

import { useNotebookEditor } from './useNotebookEditor';

// ********************************************************************************
// ensures that all React children that use this hook have access to a defined Editor
export const useValidatedEditor = (): Editor => {
  const { editor } = useNotebookEditor();
  if(!editor) throw new Error('useValidatedEditor must be used within the context of the Editor Service');

  return editor;
};
