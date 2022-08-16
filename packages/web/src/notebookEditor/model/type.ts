import { EditorState, Transaction } from 'prosemirror-state';

// ********************************************************************************
// == Option & Storage ============================================================
// represents that the extension has no options or storage, and such the type must
// be 'unknown' to avoid using them and make the compiler to throw errors when tried
export type NoOptions = unknown/*alias*/;
export type NoStorage = unknown/*alias*/;

// == Plugin ======================================================================
export class NoPluginState {
  constructor() {/*currently nothing*/}
  apply(tr: Transaction, thisPluginState: NoPluginState, oldEditorState: EditorState, newEditorState: EditorState) { return this; }
}

// == Extension ===================================================================
export enum ExtensionName {
  ASYNC_NODE = 'asyncNode',
  CODEBLOCK_ASYNC_NODE = 'codeBlockAsyncNode',
  DROP_CURSOR = 'dropCursor',
  GAP_CURSOR = 'gapCursor',
  GAP_CURSOR_ALLOW = 'allowGapCursor'/*CHECK: is this the right place for this?*/,
  HIGHLIGHT = 'highlight',
  HISTORY = 'history',
  INLINE_NODE_WITH_CONTENT = 'inlineNodeWithContent',
  NODEVIEW_REMOVAL = 'nodeViewRemoval',
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

  // NOTE: Since codeBlockAsyncNodes are a subset of async nodes that can be
  //       dirty depending on whether or not specific criteria is met, the
  //       asyncNodes must check if they are dirty after the codeBlocks have
  //       been modified accordingly (e.g. codeBlockReferences and hashes) have
  //       been recomputed. Hence this must run before asyncNodes
  CODEBLOCK_ASYNC_NODE = 116,

  // NOTE: AsyncNodes effectively 'disable' the undo command while they are
  //       performing async operations. In order for the undo event (CMD-Z) to
  //       be handled before the history extension does its job
  //       (SEE: History.ts) they're given a higher priority than 100
  ASYNC_NODE = 115,

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
