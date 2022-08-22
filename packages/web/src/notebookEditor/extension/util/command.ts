import { Editor } from '@tiptap/core';

// ********************************************************************************
// returns the props needed for a Command
export const getCommandProps = (editor: Editor) => ({ state: editor.state, dispatch: editor.view.dispatch, view: editor.view });
