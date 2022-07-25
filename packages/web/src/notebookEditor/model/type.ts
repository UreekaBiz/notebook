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
  GAP_CURSOR = 'gapCursor',
  GAP_CURSOR_ALLOW = 'allowGapCursor'/*CHECK: is this the right place for this?*/,
  HIGHLIGHT = 'highlight',
  NODEVIEW_REMOVAL = 'nodeViewRemoval',
  UNIQUE_NODE_ID = 'uniqueNodeId',
  SET_DEFAULT_MARKS = 'setDefaultMarks',
  STYLE = 'style',
}

// == Priority ====================================================================
// NOTE: priority can affect extensions, nodes and marks
// NOTE: names match extension, node or mark names for sanity.
export enum ExtensionPriority {
  NODEVIEW_REMOVAL = 110,
  PARAGRAPH = 1000/*take precedence over everything else*/,
  UNIQUE_NODE_ID = 109,
}

// == Selection ===================================================================
// The depth of the selection from the current node.
// 0 is the base node, selection.depth is the parent node.
export type SelectionDepth = number | undefined/*current node*/;
