import { Editor } from '@tiptap/core';

import { Command } from '@ureeka-notebook/web-service';

// ********************************************************************************
/** Executes the given {@link Command} with the current {@link Editor} props */
export const shortcutCommandWrapper = (editor: Editor, command: Command) => {
  const { state, view } = editor;
  const { dispatch } = view;

  return command(state, dispatch, view);
};
