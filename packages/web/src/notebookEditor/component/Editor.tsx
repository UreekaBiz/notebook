import { Box } from '@chakra-ui/react';
import { EditorContent } from '@tiptap/react';
import { useEffect, useState } from 'react';
import Router from 'next/router';

import { findNodeById, getLogger, setNodeSelectionCommand, setTextSelectionCommand, Logger } from '@ureeka-notebook/web-service';

import { useNotebookEditor } from 'notebookEditor/hook/useNotebookEditor';
import { getFocusedNodeIdFromURL } from 'notebookEditor/util';

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
  // ensure that the Node present in the Route of the Editor receives focus once
  // the Editor has been created and rendered (and hence its content loaded)
  // SEE: Document.ts
  useEffect(() => {
    const nodeId = getFocusedNodeIdFromURL(Router.asPath);
    if(!nodeId) return/*no nodeId specified, nothing to do*/;

    const nodePosition = findNodeById(editor.state.doc, nodeId);
    if(!nodePosition) return/*nothing to do, Node does not exist*/;

    if(nodePosition.node.isBlock) {
      const focusPos = nodePosition.position + nodePosition.node.nodeSize/*at the end of the node*/ - 1/*still inside of it*/;
      setTextSelectionCommand({ from: focusPos, to: focusPos })(editor.view.state, editor.view.dispatch);
    } else {
      setNodeSelectionCommand(nodePosition.position)(editor.view.state, editor.view.dispatch);
    }

    editor.view.focus();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [/*explicitly only on the first render*/]);

  // ..............................................................................
  // prevent the User from navigate away from the page or reload the page if the
  // Editor has pending writes. A generic modal will be shown as a AYS to the User.
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

  // ..............................................................................
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
  const handleClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    // NOTE: since this Event Handler runs before other view element event
    //       handlers (e.g. TaskListItem checkboxes), ensure that it is a Div that
    //       is being clicked so that the Selection is not being modified
    //       incorrectly. More checks might have to be added in the future
    if(!(event.target instanceof HTMLDivElement)) return/*(SEE: NOTE above)*/;

    if(!editor) return/*nothing to do*/;
    if(editor.isFocused) return/*already focused*/;

    const focusPos = editor.state.doc.nodeSize - 2/*account for start and end of Doc*/;
    setTextSelectionCommand({ from: focusPos, to: focusPos })(editor.state, editor.view.dispatch);
    editor.view.focus();
  };

  // == UI ========================================================================
  return (
    <Box id={EDITOR_CONTAINER_ID} className={isActionModifierPressed ? EDITOR_ACTIONABLE_CLASS : ''} height='full' overflowY='auto' onClick={(event) => handleClick(event)}>
      <EditorUserInteractions />
      <EditorContent editor={editor} />
    </Box>
  );
};
