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

  TextStyleAttributes,
  TextAlign,
  VerticalAlign,

  HTMLAttributes,
  StyleAttributes,

  SetAttributeType,

  mergeAttributes,
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
  getNodeName,

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

  // -- Mark Specs ----------------------------------------------------------------
  BoldMarkSpec,
  TextStyleMarkSpec,

  // -- Mark Types ----------------------------------------------------------------
  BoldMarkType,
  isBoldMark,
  TextStyleMarkType,
  isTextStyleMark,

  // == HTML Renderer =============================================================
  convertContentToHTML,
  convertJSONContentToHTML,
  getRenderTag,

  // -- HTML Render Specs ---------------------------------------------------------
  DocumentNodeRendererSpec,
  HeadingNodeRendererSpec,
  ParagraphNodeRendererSpec,
  TextNodeRendererSpec,

  NodeRendererSpecs,

  // == Content ===================================================================
  NotebookDocumentContent,
  contentToNode,
  contentToJSONNode,
  nodeToContent,
} from '@ureeka-notebook/service-common';
