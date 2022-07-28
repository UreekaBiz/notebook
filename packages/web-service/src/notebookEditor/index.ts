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
  ParagraphNodeSpec,
  TextNodeSpec,

  // -- Node Types ----------------------------------------------------------------
  DocumentNodeType,
  isDocumentNode,
  HeadingNodeType,
  isHeadingNode,
  ParagraphNodeType,
  isParagraphNode,
  TextNodeType,
  isTextNode,

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
} from '@ureeka-notebook/service-common';
