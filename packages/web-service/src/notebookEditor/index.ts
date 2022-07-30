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
  isHeadingLevel,
  HeadingAttributes,

  ParagraphAttributes,

  ImageAttributes,
  DefaultImageAttributes,
  MAX_IMAGE_HEIGHT,
  MIN_IMAGE_HEIGHT,
  MAX_IMAGE_WIDTH,
  MIN_IMAGE_WIDTH,

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
  TitleNodeSpec,

  // -- Node Types ----------------------------------------------------------------
  DocumentNodeType,
  isDocumentNode,
  HeadingNodeType,
  isHeadingNode,
  ImageNodeType,
  isImageNode,
  ParagraphNodeType,
  isParagraphNode,
  TextNodeType,
  isTextNode,
  TitleNodeType,
  isTitleNode,

  // == Marks =====================================================================
  JSONMark,
  MarkName,
  getMarkName,
  getMarkValue,

  // -- Mark Specs ----------------------------------------------------------------
  BoldMarkSpec,
  MarkSpecs,
  StrikethroughMarkSpec,
  TextStyleMarkSpec,

  // -- Mark Types ----------------------------------------------------------------
  BoldMarkType,
  isBoldMark,
  TextStyleMarkType,
  isTextStyleMark,

  // == HTML Renderer =============================================================
  DATA_NODE_TYPE,

  convertContentToHTML,
  convertJSONContentToHTML,
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
