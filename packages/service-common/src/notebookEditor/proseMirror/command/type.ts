import { EditorState, Transaction } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';

import { NotebookSchemaType } from '../schema';

// ********************************************************************************
// TODO: create applyDocumentUpdates for cloud-functions and use
//       AbstractDocumentUpdates as needed

// == Command =====================================================================
// Commands are meant to be atomic (i.e. they "encapsulate functionality"). The
// Transaction dispatched by a Command goes through one DocumentUpdate. Multiple
// DocumentUpdates can be executed in a single operation through the
// applyDocumentUpdates method (SEE: web/src/command/update.ts)
export type Command = (state: EditorState, dispatch: (tr: Transaction) => void, view?: EditorView)
  => boolean/*indicates whether the command can be performed*/;

// == Update ======================================================================
// A DocumentUpdate encapsulates the individual modifications that a Transaction
// goes through. DocumentUpdates can be performed once in a single operation
// through a Command, or their functionality can be chained into a single operation
// through the applyDocumentUpdates method (SEE: web/src/command/update.ts)
export type DocumentUpdate = Readonly<{
  /** modifies the specified ProseMirror Document */
  update: (editorState: EditorState<NotebookSchemaType>, tr: Transaction<NotebookSchemaType>, view?: EditorView) => UpdateResult;
}>;

// AbstractDocumentUpdates provide an unified interface that can be used by the
// server and the client, while at the same time allowing Commands to maintain
// their 'single operation' semantics
export abstract class AbstractDocumentUpdate implements DocumentUpdate {
  // NOTE: return the modified Transaction so that it can be dispatched by Commands
  public abstract update(editorState: EditorState<NotebookSchemaType>, tr: Transaction<NotebookSchemaType>, view?: EditorView): UpdateResult;
}

// allow maintaining ProseMirror Command 'return' semantics. Whenever a Command or
// DocumentUpdate is allowed to proceed, the updated Transaction is returned.
// Otherwise, false is returned, like regular PM Commands
type UpdateResult = Transaction<NotebookSchemaType> | false;
