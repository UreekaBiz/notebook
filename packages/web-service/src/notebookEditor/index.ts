// ** Local ***********************************************************************
export * from './proseMirror';
export * from './service';

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

  HeadingLevel,
  getHeadingLevelFromTag,
  isHeadingLevel,
  HeadingAttributes,

  ParagraphAttributes,

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
  getNodeOffset,

  // -- Node Specs ----------------------------------------------------------------
  NodeSpecs,
  DocumentNodeSpec,
  HeadingNodeSpec,
  ImageNodeSpec,
  ParagraphNodeSpec,
  TextNodeSpec,

  getNodeOutputSpec,

  // -- Node Types ----------------------------------------------------------------
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

  StrikethroughMarkType,
  createStrikethroughMark,
  getStrikethroughMarkType,
  isStrikethroughMark,

  TextStyleMarkType,
  createTextStyleMark,
  getTextStyleMarkType,
  isTextStyleMark,

  // == HTML Renderer =============================================================
  DATA_MARK_TYPE,
  DATA_NODE_TYPE,

  convertContentToHTML,
  getRenderTag,

  // -- HTML Render Specs ---------------------------------------------------------
  DocumentNodeRendererSpec,
  HeadingNodeRendererSpec,
  ParagraphNodeRendererSpec,
  TextNodeRendererSpec,

  MarkRendererSpecs,
  NodeRendererSpecs,

  // == Command ===================================================================
  CommandFunctionType,

  // == Content ===================================================================
  NotebookDocumentContent,
  contentToNode,
  contentToJSONNode,
  nodeToContent,

  // == Utility ===================================================================
  computeRemovedNodeObjs,
  findContentDifferencePositions,
  getNodesAffectedByStepMap,
  wereNodesAffectedByTransaction,
} from '@ureeka-notebook/service-common';
