import { EditorState, Transaction } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';

// ********************************************************************************
export type Command = (state: EditorState, dispatch: (tr: Transaction) => void, view?: EditorView/*not given means the Command does not require it*/)
  => boolean/*indicates whether the command can be performed*/;
