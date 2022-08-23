import { Editor } from '@tiptap/core';

import { Command, SelectionDepth } from '@ureeka-notebook/web-service';

// ********************************************************************************
/**
 * Executes the given {@link Command} with the current {@link Editor} props.
 * Used by Keyboard Shortcuts
 */
export const shortcutCommandWrapper = (editor: Editor, command: Command) => {
  const { state, view, dispatch } = getCommandPropsFromEditor(editor);
  const commandResult = command(state, dispatch, view);
  view.focus();
  return commandResult;
};

/**
 * Executes the given {@link Command} with the current {@link Editor} props.
 * Used by ToolItems
 */
 export const toolItemCommandWrapper = (editor: Editor, depth: SelectionDepth, command: Command) => {
  const { state, view, dispatch } = getCommandPropsFromEditor(editor);
  const commandResult = command(state, dispatch, view);
  view.focus();
  return commandResult;
};

/** Returns the required props to execute a {@link Command} from a given {@link Editor} */
const getCommandPropsFromEditor = (editor: Editor) => ({
  state: editor.state,
  view: editor.view,
  dispatch: editor.view.dispatch,
});
