import { Editor } from '@tiptap/react';
import { createContext } from 'react';

import { NotebookEditorService, NotebookIdentifier } from '@ureeka-notebook/web-service';

// ********************************************************************************
export type NotebookEditorState = Readonly<{
  notebookId: NotebookIdentifier;

  editor: Editor;
  editorService: NotebookEditorService;
}> | null/*not initialized*/;

export const NotebookEditorContext = createContext<NotebookEditorState>(null/*not initialized by default*/);
             NotebookEditorContext.displayName = 'NotebookEditorContext';
