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
  const [isActionModifierPressed, setIsActionModifierPressed] = useState(false);

  // == Effect ====================================================================
  useEffect(() => {
    const subscription = editorService.onPendingWrites$().subscribe({
      next: (hasPendingWrite) => {
        // FIXME: show somewhere in the Editor / Toolbar and tie it to the something
        //        that prevents the User from navigating away from the page until the
        //        until no longer pending (confirm with an AYS!)
        console.log(hasPendingWrite ? 'Saving changes ...' : 'Changes saved!');
      },
      error: (error) => {
        log.info(`Unexpected error listening Notebook Editor pending writes. Reason: `, error);
      },
    });

    return () => {
      subscription.unsubscribe();
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

    editor.commands.focus(editor.state.selection.$anchor.pos);
  };

  // == UI ========================================================================
  return (
    <Box id={EDITOR_CONTAINER_ID} className={isActionModifierPressed ? EDITOR_ACTIONABLE_CLASS : ''} height='full' overflowY='auto' onClick={handleClick}>
      <EditorUserInteractions />
      <EditorContent editor={editor} />
    </Box>
  );
};
