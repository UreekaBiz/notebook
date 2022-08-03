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
// NOTE: priority can affect extensions, Nodes and Marks

// -- Extension -------------------------------------------------------------------
// NOTE: if extension priority is left unspecified, it defaults to 100
// NOTE: names match extension, Node or Mark names for sanity.
export enum ExtensionPriority {
  // -- Extension -----------------------------------------------------------------
  UNIQUE_NODE_ID = 120/*T&E*/,
  NODEVIEW_REMOVAL = 119,

  // -- Node ----------------------------------------------------------------------
  // NOTE: Paragraph must have a higher priority than other block Nodes since it
  //       is the 'default' block Node (by convention). If its priority is left
  //       unspecified, the default block Node on document creation will be the
  //       first block Node encountered in the editor extension array
  //       (SEE: notebookEditor/type.ts)
  PARAGRAPH = 118,

  // NOTE: Link must have a higher priority than other marks so that it gets
  //       preference over them when creating, pasting or applying parse rules
  LINK = 117/*T&E*/,

  // NOTE: Since the text extension adds a \t whenever Tab is pressed, but this
  //       behavior is not always guaranteed to be the desired one (e.g. when
  //       going through a list Node), the text extension runs last (SEE: note
  //       above for default extension priority). This ensures that the shortcuts
  //       defined in the text extension run only if their trigger was not handled
  //       by another extension previously
  TEXT = 99,

  // -- Mark ----------------------------------------------------------------------
  // Currently nothing
}

// NOTE: if parse rule priority is left unspecified, it defaults to 50
// NOTE: names match extension, Node or Mark names for sanity.
export enum ParseRulePriority {
  // NOTE: since MarkHolders are also rendered as div elements, they need to take
  //       priority over other nodes (such as Paragraphs or Headings)
  //       when being parsed (SEE: MarkHolder.ts)
  MARK_HOLDER = 52,
}

// == Selection ===================================================================
// the depth of the selection from the current Node. 0 is the base Node,
// `selection.depth` is the parent Node.
export type SelectionDepth = number | undefined/*current Node*/;
