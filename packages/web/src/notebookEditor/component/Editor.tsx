import { Box } from '@chakra-ui/react';
import { EditorContent } from '@tiptap/react';
import { useEffect } from 'react';

import { getLogger, Logger } from '@ureeka-notebook/web-service';

import { useNotebookEditor } from 'notebookEditor/hook/useNotebookEditor';

import { EditorUserInteractions } from './EditorUserInteractions';

const log = getLogger(Logger.NOTEBOOK);

// ********************************************************************************
export const EDITOR_CONTAINER_ID = 'NotebookEditorContainerID';

export const Editor = () => {
  const { editor, editorService } = useNotebookEditor();

  // == Effects ===================================================================
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

  // == Handler ===================================================================
  const handleClick = () => {
    if(!editor) return/*nothing to do*/;
    if(editor.isFocused) return/*already focused*/;

    editor.commands.focus(editor.state.selection.$anchor.pos);
  };

  // == UI ========================================================================
  return (
    <Box id={EDITOR_CONTAINER_ID} height='full' overflowY='auto' onClick={handleClick}>
      <EditorUserInteractions />
      <EditorContent editor={editor} />
    </Box>
  );
};
