import { noNodeOrMarkSpecAttributeDefaultValue, AttributeType, AttributesTypeFromNodeSpecAttributes } from '../../attribute';
import { VisualId } from '../../htmlRenderer/state';
import {  NodeIdentifier, NodeName } from '../../node';
import { getThemeValue } from '../../theme/theme';

// ********************************************************************************
// == Attribute ===================================================================
// NOTE: must be present on the NodeSpec below
// NOTE: This values must have matching types the ones defined in the Extension
export const CodeBlockReferenceNodeAttributeSpec = {
  [AttributeType.Id]: noNodeOrMarkSpecAttributeDefaultValue<NodeIdentifier>(),

   // the Id of the CodeBlock referenced by this CodeBlockReference
   [AttributeType.CodeBlockReference]: noNodeOrMarkSpecAttributeDefaultValue<CodeBlockReference>(),

  // the string that wraps the CodeBlockReference to the left
  [AttributeType.LeftDelimiter]: noNodeOrMarkSpecAttributeDefaultValue<string>(),
  // the string that wraps the CodeBlockReference to the right
  [AttributeType.RightDelimiter]: noNodeOrMarkSpecAttributeDefaultValue<string>(),
};
export type CodeBlockReferenceAttributes = AttributesTypeFromNodeSpecAttributes<typeof CodeBlockReferenceNodeAttributeSpec>;

// == Type ========================================================================
export type CodeBlockReference = NodeIdentifier/*alias*/;

// == Util ========================================================================
export const DEFAULT_CODEBLOCK_REFERENCE_NODE_TEXT = 'ref'/*creation default*/;

// NOTE: obtaining the visualId is left to the caller since the checks may vary
//       depending on where the CodeBlockReference will be displayed (e.g. in
//       NodeView, Renderer)
export const computeCodeBlockReferenceText = (attrs: Partial<CodeBlockReferenceAttributes>, visualId: VisualId) => {
  // NOTE: checking explicitly for undefined for Delimiters since white spaces
  //       and 0s are allowed Delimiters. Not using isBlank() for the same reason
  let leftDelimiter = attrs[AttributeType.LeftDelimiter];
  if(leftDelimiter === undefined) leftDelimiter = getThemeValue(NodeName.CODEBLOCK_REFERENCE, AttributeType.LeftDelimiter);

  let rightDelimiter = attrs[AttributeType.RightDelimiter];
  if(rightDelimiter === undefined) rightDelimiter = getThemeValue(NodeName.CODEBLOCK_REFERENCE, AttributeType.RightDelimiter);

  return `${leftDelimiter}${visualId}${rightDelimiter}`;
};
