// ** Local ***********************************************************************
export * from './service';
export * from './NodeObserver/type';

// ** Service-Common **************************************************************
export {
  // == Collaboration =============================================================
  NotebookUsers,
  NotebookUserSession,
  NotebookUserSessions,

  // == Schema ====================================================================
  NotebookSchemaType,

  // -- Schema Version ------------------------------------------------------------
  NotebookSchemaVersion,

  SchemaV2,

  // == Attributes ================================================================
  AttributeType,
  AttributeValue,
  Attributes,

  Margin,
  MarginAttribute,
  isMarginAttribute,
  Padding,
  PaddingAttribute,
  isPaddingAttribute,
  SpacingAttribute,
  SpacingType,
  getOppositeSpacingAttribute,

  BorderStyle,
  TextStyleAttributes,
  TextAlign,
  VerticalAlign,

  HTMLAttributes,
  StyleAttributes,

  SetAttributeType,

  isBorderStyle,
  InvalidMergedAttributeValue,
  MergedAttributeValue,
  mergeAttributes,
  mergeAttributeValues,
  getRenderAttributes,
  getSerializableAttributes,
  isStyleAttribute,
  getWrapStyles,

  AsyncNodeAttributes,
  isAsyncNodeAttributes,

  BlockquoteAttributes,
  DEFAULT_BLOCKQUOTE_BORDER_LEFT_COLOR,
  DEFAULT_BLOCKQUOTE_BORDER_LEFT_WIDTH,

  CodeBlockAttributes,
  isCodeBlockAttributes,
  CodeBlockType,
  EMPTY_CODEBLOCK_HASH,
  DATA_VISUAL_ID,
  REMOVED_CODEBLOCK_VISUALID,

  CodeBlockAsyncNodeAttributes,
  isCodeBlockAsyncNodeAttributes,

  CodeBlockReference,
  CodeBlockReferenceAttributes,
  computeCodeBlockReferenceText,
  DEFAULT_CODEBLOCK_REFERENCE_NODE_TEXT,

  Demo2AsyncNodeAttributes,
  DEFAULT_DEMO_2_ASYNC_NODE_DELAY,
  DEFAULT_DEMO_2_ASYNC_NODE_STATUS,

  DemoAsyncNodeAttributes,
  createDefaultDemoAsyncNodeAttributes,
  DEFAULT_DEMO_ASYNC_NODE_DELAY,
  DEFAULT_DEMO_ASYNC_NODE_STATUS,
  DEFAULT_DEMO_ASYNC_NODE_TEXT,

  createEditableInlineNodeWithContent,
  getEditableInlineNodeWithContentNodeType,
  EditableInlineNodeWithContentAttributes,

  HeadingLevel,
  getHeadingLevelFromTag,
  isHeadingLevel,
  HeadingAttributes,

  DEFAULT_HORIZONTAL_RULE_BACKGROUND_COLOR,
  DEFAULT_HORIZONTAL_RULE_HEIGHT,

  ParagraphAttributes,

  isInlineNodeWithContent,
  INLINE_NODE_CONTAINER_CLASS,

  ImageAttributes,
  defaultImageAttributes,
  DEFAULT_IMAGE_BORDER_COLOR,
  DEFAULT_IMAGE_BORDER_STYLE,
  DEFAULT_IMAGE_BORDER_WIDTH,
  DEFAULT_IMAGE_ERROR_SRC,
  DEFAULT_IMAGE_HEIGHT,
  DEFAULT_IMAGE_MAX_HEIGHT,
  DEFAULT_IMAGE_MAX_WIDTH,
  DEFAULT_IMAGE_MIN_HEIGHT,
  DEFAULT_IMAGE_MIN_WIDTH,
  DEFAULT_IMAGE_SRC,
  DEFAULT_IMAGE_PARSE_TAG,
  DEFAULT_IMAGE_WIDTH,
  IMAGE_ERROR_CLASS,

  LinkAttributes,
  isLinkMarkAttributes,
  DEFAULT_LINK_ATTRIBUTES,
  LinkTarget,
  isLinkTargetValue,
  DEFAULT_LINK_HREF,
  DEFAULT_LINK_TAG,
  DEFAULT_LINK_TARGET,
  LINK_PROTOCOLS,
  PREVENT_LINK_META,

  ListItemAttributes,
  LIST_ITEM_DEFAULT_SEPARATOR,
  DATA_LIST_ITEM_LIST_STYLE,
  DATA_LIST_ITEM_SEPARATOR,

  getNestedViewNodeTextString,
  isNestedViewNode,
  NESTED_VIEW_NODE_EMPTY_NODE_CLASS,
  NESTED_NODE_VIEW_INNER_VIEW_DISPLAY_CONTAINER_CLASS,
  NESTED_NODE_VIEW_RENDER_DISPLAY_CONTAINER_CLASS,

  OrderedListAttributes,
  ORDERED_LIST_DEFAULT_START,

  // == Nodes =====================================================================
  JSONNode,
  NodeName,
  NodeTag,
  NodeIdentifier,
  generateNodeId,
  getNodeName,
  isNodeName,
  isNodeType,

  asyncNodes,

  // -- Node Specs ----------------------------------------------------------------
  NodeSpecs,
  BlockquoteNodeSpec,
  BulletListNodeSpec,
  CodeBlockNodeSpec,
  CodeBlockReferenceNodeSpec,
  DemoAsyncNodeSpec,
  Demo2AsyncNodeSpec,
  DocumentNodeSpec,
  HeadingNodeSpec,
  HorizontalRuleNodeSpec,
  ImageNodeSpec,
  MarkHolderNodeSpec,
  OrderedListNodeSpec,
  ParagraphNodeSpec,
  TaskListNodeSpec,
  TaskListItemNodeSpec,
  TextNodeSpec,

  getNodeOutputSpec,

  // -- Node Types ----------------------------------------------------------------
  AsyncNodeType,
  isAsyncNode,

  BlockquoteNodeType,
  isBlockquoteNode,

  BulletListNodeType,
  isBulletListNode,

  CodeBlockNodeType,
  createCodeBlockNode,
  getCodeBlockNodeType,
  isCodeBlockNode,

  CodeBlockAsyncNodeType,
  isCodeBlockAsyncNode,

  CodeBlockReferenceNodeType,
  createCodeBlockReferenceNode,
  isCodeBlockReferenceNode,
  getCodeBlockReferenceNodeType,

  Demo2AsyncNodeType,
  createDemo2AsyncNodeNode,
  getDemo2AsyncNodeNodeType,
  isDemo2AsyncNode,

  DemoAsyncNodeType,
  createDemoAsyncNodeNode,
  getDemoAsyncNodeNodeType,
  isDemoAsyncNode,

  EditableInlineNodeWithContentNodeType,
  EditableInlineNodeWithContentNodeSpec,
  isEditableInlineNodeWithContentNode,

  DocumentNodeType,
  getDocumentNodeType,
  isDocumentNode,

  HeadingNodeType,
  createHeadingNode,
  getHeadingNodeType,
  isHeadingNode,

  createHorizontalRuleNode,
  HorizontalRuleNodeType,
  getHorizontalRuleNodeType,
  isHorizontalRuleNode,

  ImageNodeType,
  createImageNode,
  getImageNodeType,
  isImageNode,

  isListStyle,
  ListStyle,

  createListItemNode,
  getListItemNodeType,
  isListItemNode,
  isListItemNodeType,
  ListItemNodeSpec,
  ListItemNodeType,

  createListItemContentNode,
  getListItemContentNodeType,
  isListItemContentNode,
  ListItemContentNodeSpec,

  MarkHolderNodeType,
  createMarkHolderNode,
  getMarkHolderNodeType,
  isMarkHolderNode,
  storedMarksFromDOM,

  NestedViewNodeType,

  NestedViewBlockNodeType,
  NestedViewBlockNodeSpec,
  getNestedViewBlockNodeType,
  isNestedViewBlockNode,

  getOrderedListNodeType,
  OrderedListNodeType,

  ParagraphNodeType,
  createParagraphNode,
  getParagraphNodeType,
  isParagraphNode,

  TaskListNodeType,
  isTaskListNode,

  createTaskListItemNode,

  TaskListItemNodeType,
  isTaskListItemNode,

  TextNodeType,
  createTextNode,
  getTextNodeType,
  isTextNode,

  // == Marks =====================================================================
  JSONMark,
  MarkName,
  extendMarkRangeCommand,
  ExtendMarkRangeDocumentUpdate,
  getMarksBetween,
  getMarkName,
  getMarkValue,
  isMarkName,
  markFromJSONMark,
  parseStringifiedMarksArray,
  setMarkCommand,
  SetMarkDocumentUpdate,
  stringifyMarksArray,
  toggleMarkCommand,
  ToggleMarkDocumentUpdate,
  unsetMarkCommand,
  UnsetMarkDocumentUpdate,

  // -- Mark Specs ----------------------------------------------------------------
  BoldMarkSpec,
  CodeMarkSpec,
  ItalicMarkSpec,
  LinkMarkSpec,
  MarkSpecs,
  ReplacedTextMarkMarkSpec,
  StrikethroughMarkSpec,
  SubScriptMarkSpec,
  SuperScriptMarkSpec,
  TextStyleMarkSpec,
  UnderlineMarkSpec,

  getMarkOutputSpec,

  // -- Mark Types ----------------------------------------------------------------
  BoldMarkType,
  createBoldMark,
  getBoldMarkType,
  isBoldMark,

  CodeMarkType,
  createCodeMark,
  getCodeMarkType,
  isCodeMark,

  ItalicMarkType,
  createItalicMark,
  getItalicMarkType,
  isItalicMark,

  LinkMarkType,
  createLinkMark,
  getLinkMarkType,
  isLinkMark,

  isOrderedListNode,

  ReplacedTextMarkMarkType,
  createReplacedTextMarkMark,
  getReplacedTextMarkMarkType,
  isReplacedTextMarkMark,

  SubScriptMarkType,
  createSubScriptMark,
  getSubScriptMarkType,
  isSubScriptMark,

  SuperScriptMarkType,
  createSuperScriptMark,
  getSuperScriptMarkType,
  isSuperScriptMark,

  StrikethroughMarkType,
  createStrikethroughMark,
  getStrikethroughMarkType,
  isStrikethroughMark,

  TextStyleMarkType,
  createTextStyleMark,
  getTextStyleMarkType,
  isTextStyleMark,

  UnderlineMarkType,
  createUnderlineMark,
  getUnderlineMarkType,
  isUnderlineMark,

  // == HTML Renderer =============================================================
  ACTIONABLE_NODE,
  createNodeDataAttribute,
  DATA_NODE_TYPE,
  createNodeDataTypeAttribute,
  DATA_MARK_TYPE,
  createMarkDataTypeAttribute,

  convertContentToHTML,
  getRenderTag,

  // -- HTML Render Specs ---------------------------------------------------------
  CodeBlockNodeRendererSpec,
  CodeBlockReferenceNodeRendererSpec,
  Demo2AsyncNodeRendererSpec,
  DemoAsyncNodeRendererSpec,
  DocumentNodeRendererSpec,
  HeadingNodeRendererSpec,
  ParagraphNodeRendererSpec,
  TextNodeRendererSpec,

  MarkRendererSpecs,
  NodeRendererSpecs,

  RendererState,

  CodeBlockRendererState,

  // == JSX =======================================================================
  CodeBlockComponentJSX,
  CodeBlockReferenceComponentJSX,
  Demo2AsyncNodeComponentJSX,
  DemoAsyncNodeComponentJSX,

  // == Command ===================================================================
  Command,

  // == Update ====================================================================
  AbstractDocumentUpdate,

  // == Content ===================================================================
  NotebookDocumentContent,
  contentToNode,
  contentToJSONNode,
  nodeToContent,
  ProseMirrorNodeContent,

  // == Theme =====================================================================
  Theme,
  Themes,
  ThemeName,

  notebookEditorTheme,
  getHeadingThemeValue,
  getThemeValue,

  // == Utility ===================================================================
  // -- State ---------------------------------------------------------------------
  codeBlockLevel,
  updateStack,

  VisualId,
  VisualIdMap,

  // -- Async ---------------------------------------------------------------------
  asyncNodeStatusToColor,
  AsyncNodeStatus,
  ASYNC_NODE_DIRTY_DATATYPE,

  // -- Misc ----------------------------------------------------------------------
  // .. Document ..................................................................
  extractDocumentName,
  HISTORY_META,

  // .. Node .....................................................................
  clearNodesCommand,
  ClearNodesDocumentUpdate,
  createBlockNodeCommand,
  CreateBlockNodeDocumentUpdate,
  computeRemovedNodePositions,
  findChildrenInRange,
  findContentDifferencePositions,
  findNodeById,
  findParentNode,
  getParentNode,
  getNodesAffectedByTransaction,
  getNodesAffectedByStepMap,
  getNodesRemovedByTransaction,
  insertNewlineCommand,
  InsertNewlineDocumentUpdate,
  leaveBlockNodeCommand,
  LeaveBlockNodeDocumentUpdate,
  liftEmptyBlockNodeCommand,
  LiftEmptyBlockNodeDocumentUpdate,
  joinBackwardCommand,
  JoinBackwardDocumentUpdate,
  NodePosition,
  nodeToTagId,
  ParentNodePosition,
  updateAttributesCommand,
  UpdateAttributesDocumentUpdate,
  updateAttributesInRangeCommand,
  UpdateAttributesInRangeDocumentUpdate,
  updateSingleNodeAttributesCommand,
  UpdateSingleNodeAttributesDocumentUpdate,
  wereNodesAffectedByTransaction,

  // .. Selection .................................................................
  deleteSelectionCommand,
  DeleteSelectionDocumentUpdate,
  getAllAscendantsFromSelection,
  getBlockNodeRange,
  getPosType,
  getSelectedNode,
  isGapCursorSelection,
  isGetPos,
  isNodeSelection,
  isTextSelection,
  replaceAndSelectNodeCommand,
  ReplaceAndSelectNodeDocumentUpdate,
  resolveNewSelection,
  SelectionRange,
  SelectionDepth,
  selectBlockNodeContentCommand,
  SelectBlockNodeContentDocumentUpdate,
  selectNodeBackwardCommand,
  SelectNodeBackwardDocumentUpdate,
  setNodeSelectionCommand,
  SetNodeSelectionDocumentUpdate,
  setSelectionCommand,
  SetSelectionDocumentUpdate,
  setTextSelectionCommand,
  SetTextSelectionDocumentUpdate,

  // .. Range ....................................................................
  getTransformChangedRanges,

  // .. Step ......................................................................
  combineTransactionSteps,

} from '@ureeka-notebook/service-common';
