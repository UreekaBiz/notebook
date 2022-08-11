import { EditorState } from 'prosemirror-state';

// ********************************************************************************
export type DocumentUpdate = Readonly<{
  /** modifies the specified ProseMirror Document */
  update: (state: EditorState) => void;
}>;
