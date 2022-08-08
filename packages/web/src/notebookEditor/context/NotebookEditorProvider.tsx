import { useToast } from '@chakra-ui/react';
import { useEditor } from '@tiptap/react';
import { useEffect, useState, ReactNode } from 'react';

import { getLogger, Notebook, NotebookEditorService, NotebookIdentifier, Logger, NodeIdentifier } from '@ureeka-notebook/web-service';

import { useAuthedUser } from 'authUser/hook/useAuthedUser';
import { notebookEditorTheme } from 'notebookEditor/extension/theme/theme';
import { focusEditor } from 'notebookEditor/focus';
import { editorDefinition } from 'notebookEditor/type';
import { Loading } from 'shared/component/Loading';
import { useAsyncStatus, useIsMounted } from 'shared/hook';
import { NotFoundPage } from 'shared/pages/NotFoundPage';

import { NotebookEditorContext } from './NotebookEditorContext';

const log = getLogger(Logger.NOTEBOOK);

// ************************************************************************************
interface Props {
  notebook: Notebook;
  notebookId: NotebookIdentifier;
  focusedElementId?: NodeIdentifier;
  children: ReactNode;
}
export const NotebookEditorProvider: React.FC<Props> = ({ notebookId, notebook, focusedElementId, children }) => {
  const isMounted = useIsMounted();
  const [status, setStatus] = useAsyncStatus();
  const toast = useToast();

  const authedUser = useAuthedUser();
  const editor = useEditor(editorDefinition);

  // == State =====================================================================
  const [editorService, setEditorService] = useState<NotebookEditorService | null>(null/*no NotebookEditorService by default*/);

  // == Effect ====================================================================
  // creates a new NotebookEditorService for each new Notebook (assuming valid deps)
  useEffect(() => {
    if(!authedUser || !editor || (status !== 'idle'/*don't initialize twice*/)) return/*nothing to do*/;

    const initializeService = async () => {
      setStatus('loading');

      const editorService = new NotebookEditorService(authedUser.authedUser, editor, notebook.schemaVersion, notebookId);
      try {
        await editorService.initialize();
      } catch(error) {
        log.warn(`Unexpected error loading Notebook (${notebookId}). Reason: `, error);
        if(!isMounted()) return/*component is unmounted, prevent unwanted state updates*/;

        toast({ title: 'Error loading Notebook', status: 'error' });
        setStatus('error');
        return/*something went wrong* and can't continue*/;
      }

      if(!isMounted()) return/*component is unmounted, prevent unwanted state updates*/;

      setEditorService(editorService);
      setStatus('complete');

      focusEditor(editor, focusedElementId);
    };
    initializeService();

    // NOTE: see effect below to shutdown the Service
  }, [notebookId, notebook.schemaVersion, focusedElementId, isMounted, status, setStatus, toast, editor, authedUser]);

  // sets the initial theme when the component mounts
  useEffect(() => {
    notebookEditorTheme.setThemeStylesheet()/*sync stylesheet*/;
  }, []);

  // ..............................................................................
  // sync editor with NotebookEditorService on Editor updates
  // NOTE: TipTap generates a new Editor in certain circumstances. Inform the
  //       NotebookEditorService of the new Editor.
  // CHECK: *when* does TipTap generate a new Editor?
  useEffect(() => {
    if(!editor || !editorService || (status !== 'complete'/*don't update if not initialized*/)) return/*nothing to do*/;

    editorService.updateEditor(editor);
  }, [editor, editorService, status]);

  // ..............................................................................
  // remove NotebookEditorService on unmount
  useEffect(() => {
    if(editorService === null) return/*nothing to do*/;

    // Component unmounts or NotebookId changes, either way the editorService must
    // be shutdown.
    return () => editorService?.shutdown();
  }, [notebookId, editorService]);

  // ..............................................................................
  // exposes the Editor to the window console to ease debugging
  useEffect(() => {
    // @ts-expect-error TODO: Find a better way to do this
    window.editor = editor;
  }, [editor]);

  // == UI ========================================================================
  if(status === 'complete') return <NotebookEditorContext.Provider value={{ notebookId, editor: editor!, editorService: editorService! }}>{children}</NotebookEditorContext.Provider>;

  const content = status === 'error' ? <NotFoundPage message='An unexpected error has occurred' />
                : <Loading />;
  return <NotebookEditorContext.Provider value={null/*not initialized*/}>{content}</NotebookEditorContext.Provider>;
};
