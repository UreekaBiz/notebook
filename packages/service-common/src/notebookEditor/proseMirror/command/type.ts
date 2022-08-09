import { Transaction } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';

// ********************************************************************************
export type Command = (tr: Transaction, dispatch?: (tr: Transaction) => void, view?: EditorView) => boolean/*indicates whether the command can be performed*/;
