import { Editor } from '@tiptap/core';
import { EditorView } from 'prosemirror-view';

import { Command, SelectionDepth } from '@ureeka-notebook/web-service';

// ********************************************************************************
/**
 * Executes the given {@link Command} with the current {@link Editor} props.
 * Used by Keyboard Shortcuts
 */
export const shortcutCommandWrapper = (editor: Editor, command: Command) => {
  const { state, view, dispatch } = getCommandPropsFromEditor(editor);
  return focusViewAndReturn(command(state, dispatch, view), view);
};

/**
 * Executes the given {@link Command} with the current {@link Editor} props.
 * Used by ToolItems
 */
 export const toolItemCommandWrapper = (editor: Editor, depth: SelectionDepth, command: Command) => {
  const { state, view, dispatch } = getCommandPropsFromEditor(editor);
  return focusViewAndReturn(command(state, dispatch, view), view);
};

/** Returns the required props to execute a {@link Command} from a given {@link Editor} */
const getCommandPropsFromEditor = (editor: Editor) => ({
  state: editor.state,
  view: editor.view,
  dispatch: editor.view.dispatch,
});

/** Focuses the {@link EditorView} and returns the result from the executed {@link Command} */
const focusViewAndReturn = (commandResult: boolean, view: EditorView) => {
  view.focus();
  return commandResult;
};
