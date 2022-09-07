// ** Local ***********************************************************************
export * from './service';

// FIXME: Move to the service
export * from './function';

// ** Service-Common **************************************************************
export {
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

  TextStyleAttributes,
  TextAlign,
  VerticalAlign,

  HTMLAttributes,
  StyleAttributes,

  SetAttributeType,

  InvalidMergedAttributeValue,
  MergedAttributeValue,
  mergeAttributes,
  mergeAttributeValues,
  getRenderAttributes,
  isStyleAttribute,
  getWrapStyles,

  AsyncNodeAttributes,
  isAsyncNodeAttributes,

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

  HeadingLevel,
  getHeadingLevelFromTag,
  isHeadingLevel,
  HeadingAttributes,

  ParagraphAttributes,

  isInlineNodeWithContent,
  INLINE_NODE_CONTAINER_CLASS,

  ImageAttributes,
  DefaultImageAttributes,
  MAX_IMAGE_HEIGHT,
  MIN_IMAGE_HEIGHT,
  MAX_IMAGE_WIDTH,
  MIN_IMAGE_WIDTH,

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
  CodeBlockNodeSpec,
  CodeBlockReferenceNodeSpec,
  DemoAsyncNodeSpec,
  Demo2AsyncNodeSpec,
  DocumentNodeSpec,
  HeadingNodeSpec,
  ImageNodeSpec,
  MarkHolderNodeSpec,
  ParagraphNodeSpec,
  TextNodeSpec,

  getNodeOutputSpec,

  // -- Node Types ----------------------------------------------------------------
  AsyncNodeType,
  isAsyncNode,

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

  DocumentNodeType,
  getDocumentNodeType,
  isDocumentNode,

  HeadingNodeType,
  createHeadingNode,
  getHeadingNodeType,
  isHeadingNode,

  ImageNodeType,
  createImageNode,
  getImageNodeType,
  isImageNode,

  MarkHolderNodeType,
  createMarkHolderNode,
  getMarkHolderNodeType,
  isMarkHolderNode,
  storedMarksFromDOM,

  ParagraphNodeType,
  createParagraphNode,
  getParagraphNodeType,
  isParagraphNode,

  TextNodeType,
  createTextNode,
  getTextNodeType,
  isTextNode,

  // == Marks =====================================================================
  JSONMark,
  MarkName,
  extendMarkRangeCommand,
  ExtendMarkRangeDocumentUpdate,
  getMarkName,
  getMarkValue,
  isMarkActive,
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
  CommandFunctionType,

  // == Update ====================================================================
  AbstractDocumentUpdate,

  // == Content ===================================================================
  NotebookDocumentContent,
  contentToNode,
  contentToJSONNode,
  nodeToContent,

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

  // .. Node .....................................................................
  clearNodesCommand,
  ClearNodesDocumentUpdate,
  createBlockNodeCommand,
  CreateCodeBlockNodeDocumentUpdate,
  computeRemovedNodePositions,
  findContentDifferencePositions,
  findNodeById,
  getParentNode,
  getNodesAffectedByStepMap,
  nodeToTagId,
  wereNodesAffectedByTransaction,
  NodePosition,

  // .. Selection .................................................................
  getAllAscendantsFromSelection,
  getBlockNodeRange,
  getPosType,
  getSelectedNode,
  isGapCursorSelection,
  isGetPos,
  isNodeSelection,
  replaceAndSelectNodeCommand,
  ReplaceAndSelectNodeDocumentUpdate,
  resolveNewSelection,
  SelectionRange,
  SelectionDepth,
  setNodeSelectionCommand,
  SetNodeSelectionDocumentUpdate,
  setTextSelectionCommand,
  SetTextSelectionDocumentUpdate,
  updateAttributesCommand,
  UpdateAttributesDocumentUpdate,
  updateAttributesInRangeCommand,
  UpdateAttributesInRangeDocumentUpdate,

  // ..............................................................................
} from '@ureeka-notebook/service-common';
