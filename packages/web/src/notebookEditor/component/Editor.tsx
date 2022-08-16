import { Box } from '@chakra-ui/react';
import { EditorContent } from '@tiptap/react';
import { useEffect, useState } from 'react';

import { getLogger, Logger } from '@ureeka-notebook/web-service';

import { useNotebookEditor } from 'notebookEditor/hook/useNotebookEditor';

import { EditorUserInteractions } from './EditorUserInteractions';

const log = getLogger(Logger.NOTEBOOK);

// ********************************************************************************
export const EDITOR_CONTAINER_ID = 'NotebookEditorContainerID';
const EDITOR_ACTIONABLE_CLASS = 'Editor-actionable';

export const Editor = () => {
  const { editor, editorService } = useNotebookEditor();

  // == State =====================================================================
  const [isActionModifierPressed, setIsActionModifierPressed] = useState(false/*by contract*/);

  // == Effect ====================================================================
  // prevent the user from navigate away from the page or reload the page if the
  // editor has pending writes. A generic modal will be shown as a AYS to the user.
  useEffect(() => {
    let hasPendingWrite = false/*not writing by default*/;
    const subscription = editorService.onPendingWrites$().subscribe({
      next: (value) => hasPendingWrite = value,
      error: (error) => {
        log.info(`Unexpected error listening Notebook Editor pending writes. Reason: `, error);
      },
    });

    const beforeUnloadHandler = (event: BeforeUnloadEvent) => {
      if(!hasPendingWrite) return/*no need to warn*/;

      event.preventDefault();
      // NOTE: The returnValue will be shown to some users based on the browser
      //       settings. Modern browsers will show a generic string that we don't
      //       have control of.
      // SEE:  https://developer.mozilla.org/en-US/docs/Web/API/Window/beforeunload_event#compatibility_notes
      event.returnValue = 'Changes you made may not be saved.'/*default message by the browser*/;
    };
    window.addEventListener('beforeunload', beforeUnloadHandler);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('beforeunload', beforeUnloadHandler);
    };
  }, [editorService]);

  // add the actionable class to the Editor if the CMD or the CTRL keys are
  // pressed, which will make actionable nodes have special styles (SEE: index.css)
  useEffect(() => {
    const setActionableClass = (event: KeyboardEvent) => {
      if(event.ctrlKey || event.metaKey) {
        setIsActionModifierPressed(true);
      } /* else -- do not set to true */
    };
    const unsetActionableClass = (event: KeyboardEvent) => {
      if(!(event.ctrlKey) && !(event.metaKey)) {
        setIsActionModifierPressed(false);
      } /* else -- do not set to false */
    };

    window.addEventListener('keydown', setActionableClass);
    window.addEventListener('keyup', unsetActionableClass);

    return () => {
      window.removeEventListener('keydown', unsetActionableClass);
      window.removeEventListener('keyup', unsetActionableClass);
    };
  }, []);

  // == Handler ===================================================================
  const handleClick = () => {
    if(!editor) return/*nothing to do*/;
    if(editor.isFocused) return/*already focused*/;

    editor.commands.focus(editor.state.doc.nodeSize/*go to the end of the doc*/);
  };

  // == UI ========================================================================
  return (
    <Box id={EDITOR_CONTAINER_ID} className={isActionModifierPressed ? EDITOR_ACTIONABLE_CLASS : ''} height='full' overflowY='auto' onClick={handleClick}>
      <EditorUserInteractions />
      <EditorContent editor={editor} />
    </Box>
  );
};
