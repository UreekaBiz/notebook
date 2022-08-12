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
  DEMO_ASYNC_NODE_TEXT_STYLE,
  DEMO_ASYNC_NODE_STATUS_COLOR,
  DEMO_ASYNC_NODE_DATA_STATE,
  DEMO_ASYNC_NODE_BORDER_COLOR,

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
  getMarkName,
  getMarkValue,

  // -- Mark Specs ----------------------------------------------------------------
  BoldMarkSpec,
  LinkMarkSpec,
  MarkSpecs,
  ReplacedTextMarkMarkSpec,
  StrikethroughMarkSpec,
  TextStyleMarkSpec,

  getMarkOutputSpec,

  // -- Mark Types ----------------------------------------------------------------
  BoldMarkType,
  createBoldMark,
  getBoldMarkType,
  isBoldMark,

  LinkMarkType,
  createLinkMark,
  getLinkMarkType,
  isLinkMark,

  ReplacedTextMarkMarkType,
  createReplacedTextMarkMark,
  getReplacedTextMarkMarkType,
  isReplacedTextMarkMark,

  StrikethroughMarkType,
  createStrikethroughMark,
  getStrikethroughMarkType,
  isStrikethroughMark,

  TextStyleMarkType,
  createTextStyleMark,
  getTextStyleMarkType,
  isTextStyleMark,

  // == HTML Renderer =============================================================
  ACTIONABLE_NODE,
  DATA_MARK_TYPE,
  DATA_NODE_TYPE,

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

  // == Command ===================================================================
  CommandFunctionType,

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
  computeRemovedNodeObjs,
  findContentDifferencePositions,
  findNodeById,
  getParentNode,
  getNodesAffectedByStepMap,
  nodeToTagId,
  wereNodesAffectedByTransaction,
  NodeFound,

  // .. Range ....................................................................
  getNodeBlockRange,

  // ..............................................................................
  getWrapStyles,
} from '@ureeka-notebook/service-common';
