import { EditorState } from 'prosemirror-state';

// ********************************************************************************
export type DocumentUpdate = Readonly<{
  /** modifies the specified ProseMirror Document */
  update: (document: EditorState) => void;
}>;
