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
  INPUT_RULE = 'inputRule',
  NODEVIEW_REMOVAL = 'nodeViewRemoval',
  SET_DEFAULT_MARKS = 'setDefaultMarks',
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
  //       first block Node encountered in the editor Extension array
  // SEE: notebookEditor/type.ts
  PARAGRAPH = 118,

  // NOTE: Link must have a higher priority than other marks so that it gets
  //       preference over them when creating, pasting or applying parse rules
  LINK = 117/*T&E*/,

  // NOTE: asyncNodes must check if they are dirty after the codeBlocks have
  //       been modified accordingly (e.g. codeBlockReferences and hashes) have
  //       been recomputed. Hence this must run before other Extensions
  ASYNC_NODE = 116,

  // NOTE: ListItemContent Nodes have special Enter and Backspace behavior
  //       that should be handled before other List-related Extensions are
  //       called to check their handlers. (SEE: ListItemContent.ts)
  LIST_ITEM_CONTENT = 115,

  // NOTE: custom InputRules just need to be triggered before Text so that their
  //       effects are applied (SEE: InputRule.ts)
  INPUT_RULE = 114/*T&E*/,

  // NOTE: Since the text extension adds a \t whenever Tab is pressed, but this
  //       behavior is not always guaranteed to be the desired one (e.g. when
  //       going through a list Node), the Text Extension runs last. This ensures
  //       that the shortcuts defined in the Text Extension run only if their
  //       trigger was not handled by another Extension previously
  // SEE: NOTE above for default Extension priority
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

  // NOTE: TaskList parsing has preference over regular Lists
  TASK_LIST = 51,
}
