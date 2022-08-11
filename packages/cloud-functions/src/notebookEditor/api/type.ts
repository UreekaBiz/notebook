import { EditorState, Transaction } from 'prosemirror-state';

// ********************************************************************************
export type DocumentUpdate = Readonly<{
  /** modifies the specified ProseMirror Document */
  update: (editorState: EditorState, tr: Transaction) => void;
}>;
