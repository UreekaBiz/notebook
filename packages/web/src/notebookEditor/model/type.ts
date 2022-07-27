import { EditorState, Transaction } from 'prosemirror-state';

// ********************************************************************************
// == Option & Storage ============================================================
export type NoOptions = never/*alias*/;
export type NoStorage = never/*alias*/;

// == Plugin ======================================================================
export class NoPluginState {
  constructor() {/*currently nothing*/ }
  apply(tr: Transaction, thisPluginState: NoPluginState, oldEditorState: EditorState, newEditorState: EditorState) { return this; }
}

// == Extension ===================================================================
export enum ExtensionName {
  DROP_CURSOR = 'dropCursor',
  GAP_CURSOR = 'gapCursor',
  GAP_CURSOR_ALLOW = 'allowGapCursor'/*CHECK: is this the right place for this?*/,
  HIGHLIGHT = 'highlight',
  HISTORY = 'history',
  NODEVIEW_REMOVAL = 'nodeViewRemoval',
  UNIQUE_NODE_ID = 'uniqueNodeId',
  SET_DEFAULT_MARKS = 'setDefaultMarks',
  STYLE = 'style',
}

// == Priority ====================================================================
// NOTE: priority can affect extensions, nodes and marks
// NOTE: if priority is left unspecified, it defaults to 100
// NOTE: names match extension, node or mark names for sanity.
export enum ExtensionPriority {
  // -- Extension -----------------------------------------------------------------
  UNIQUE_NODE_ID = 120/*T&E*/,
  NODEVIEW_REMOVAL = 119,
  SET_DEFAULT_MARKS = 118,

  // -- Node ----------------------------------------------------------------------
  // NOTE: Paragraph must have a higher priority than other block nodes since it
  //       is the 'default' block node (by convention). If its priority is left
  //       unspecified, the default block node on document creation will be the
  //       first block node encountered in the editor extension array
  //       (SEE: notebookEditor/type.ts)
  PARAGRAPH = 117,

  // NOTE: Since the text extension adds a \t whenever Tab is pressed, but this
  //       behavior is not always guaranteed to be the desired one (e.g. when
  //       going through a list node), the text extension runs last (SEE: note
  //       above for default extension priority). This ensures that the shortcuts
  //       defined in the text extension run only if their trigger was not handled
  //       by another extension previously
  TEXT = 99,

  // -- Mark ----------------------------------------------------------------------
  // Currently nothing
}

// == Selection ===================================================================
// The depth of the selection from the current node.
// 0 is the base node, selection.depth is the parent node.
export type SelectionDepth = number | undefined/*current node*/;
