import { Attribute } from '@tiptap/core';
import { DOMOutputSpec, Node as ProseMirrorNode } from 'prosemirror-model';
import { EditorState } from 'prosemirror-state';

import { getRenderAttributes, getRenderTag, getNodeName, isTextNode, mergeAttributes, AttributeType, AttributeValue, Attributes, MarkName, NodeName, NodeRendererSpecs, NodeSpecs, SpacingAttribute, SetAttributeType } from '@ureeka-notebook/web-service';

import { theme } from 'notebookEditor/theme/theme';

import { getMarkValue } from './mark';

// ********************************************************************************
// == Util ========================================================================
export const getOppositeSpacingAttribute = (attribute: SpacingAttribute) => {
  switch(attribute) {
    case AttributeType.MarginBottom: return AttributeType.MarginTop;
    case AttributeType.MarginTop: return AttributeType.MarginBottom;
    case AttributeType.MarginLeft: return AttributeType.MarginRight;
    case AttributeType.MarginRight: return AttributeType.MarginLeft;

    case AttributeType.PaddingBottom: return AttributeType.PaddingTop;
    case AttributeType.PaddingTop: return AttributeType.PaddingBottom;
    case AttributeType.PaddingLeft: return AttributeType.PaddingRight;
    case AttributeType.PaddingRight: return AttributeType.PaddingLeft;
  }
};

/**
 * Sets the parsing behavior that will be used when parsing an {@link Attribute}
 *
 * @param name The name of the {@link Attribute} to be parsed
 * @param defaultValue The default value of the {@link Attribute} to be parsed
 * @param type The {@link SetAttributeType} for the {@link Attribute} that will be parsed
 * @returns The {@link Attribute} spec object that defines the parsing behavior of the {@link Attribute}
 */
export const setAttributeParsingBehavior = (name: string, defaultValue: string | string[] | boolean | number | undefined, type: SetAttributeType): Attribute => {
  let parseHTML: (element: HTMLElement) => string | string[] | boolean | number | null = (element: HTMLElement) => element.getAttribute(name);

  switch(type) {
    case SetAttributeType.STRING:
      break/*use default*/;
    case SetAttributeType.BOOLEAN:
      parseHTML = (element: HTMLElement) => {
        const attr = element.getAttribute(name);
        if(attr === 'true') return true;
        return false;
      };
      break;
    case SetAttributeType.NUMBER:
      parseHTML = (element: HTMLElement) => Number(element.getAttribute(name));
      break;
    case SetAttributeType.ARRAY:
      parseHTML = (element: HTMLElement) => {
        const attr = element.getAttribute(name);
        if(!attr) return [];

        return attr.split(',');
      };
      break/*use default*/;
  }

  return {
    default: defaultValue,
    parseHTML,
    keepOnSplit: false/*don't keep by default*/,
  };
};

export const setAttributeFromTheme = (attributeType: AttributeType, nodeName: NodeName) => {
  const defaultStyles = theme[nodeName],
        value = defaultStyles[attributeType];

  return setAttributeParsingBehavior(attributeType, value ?? '', SetAttributeType.STRING);
};

export const getOutputSpec = (node: ProseMirrorNode, options: Record<string, any>, HTMLAttributes: Attributes): DOMOutputSpec => {
  const nodeName = getNodeName(node);
  const nodeRendererSpec = NodeRendererSpecs[nodeName],
        nodeSpec = NodeSpecs[nodeName];

  const tag = getRenderTag(HTMLAttributes, nodeRendererSpec);
  const attributes = mergeAttributes(options.HTMLAttributes, HTMLAttributes);
  const merged = getRenderAttributes(attributes, nodeRendererSpec, nodeSpec);
  return [tag, merged, 0];
};

// -- Merging ---------------------------------------------------------------------
// Symbol that is used when the merged value of the given attributes is invalid.
// This usually means that the values are not compatible in some way.
export const InvalidMergedAttributeValue = Symbol('invalidMergedAttribute');
export type MergedAttributeValue = AttributeValue | typeof InvalidMergedAttributeValue/*could not be merged*/ | undefined/*no value*/;

/**
 * Tries to merge the given attributes in the given selection.
 */
export const getMergedAttributeValueFromSelection = (state: EditorState, attributeType: AttributeType, markType: MarkName): MergedAttributeValue => {
  const { selection } = state;
  const start = selection.$from.pos,
        end = selection.$to.pos;

  let marksMergedValue: MergedAttributeValue = undefined/*no value*/,
      nodesMergedValue: MergedAttributeValue = undefined/*no value*/;

  // Text nodes with marks are treated as different nodes by prosemirror, in the
  // case where multiple Text Nodes are selected on the given range if one of them
  // don't have the given mark then the default value to be used is the value of the
  // parent node, in this case the resulting merged value will be the merged value
  // of both marks value and nodes value.
  let hasTextNodeWithoutMarkValue = false/*by definition*/;

  // Merges the value of all different attributeType in the given range.
  state.doc.nodesBetween(start, end, (node, pos) => {
    if(isTextNode(node)) {
      const markValue = getMarkValue(node, markType, attributeType);
      if(!markValue) hasTextNodeWithoutMarkValue = true;
      marksMergedValue = mergeAttributeValues(marksMergedValue, markValue);
      return;
    } /* else -- is not a Text node */

    const nodeValue = node.attrs[attributeType];
    if(nodeValue) nodesMergedValue = mergeAttributeValues(nodesMergedValue, nodeValue);
  });

  // All Text Nodes has a valid mark with the given value, marksMerged value can be
  // safely used as the final value.
  if(!hasTextNodeWithoutMarkValue && marksMergedValue !== undefined/*marks has a value*/) return marksMergedValue;

  // Otherwise merge its value with the nodesMergedValue.
  return mergeAttributeValues(marksMergedValue, nodesMergedValue);
};

// Merges the given AttributeValues into one MergedAttributeValue.
const mergeAttributeValues = (a: MergedAttributeValue | undefined, b: MergedAttributeValue | undefined): MergedAttributeValue => {
  // If one of the values is invalid it cannot be merged.
  if(a === InvalidMergedAttributeValue || b === InvalidMergedAttributeValue) return InvalidMergedAttributeValue;

  // If one of the values if not defined will default to the other value.
  if(!a) return b;
  if(!b) return a;

  // If they are equal return either of those
  if(a === b) return a;

  // else -- the value is invalid.
  return InvalidMergedAttributeValue;
};

// TODO: Find a home for this!
// --------------------------------------------------------------------------------
// CHECK: can this do better than Partial<T>?
export const removeValue = <T extends Record<string, any>>(o: T, value: any): Partial<T> => {
  const result: any = {};
    Object.keys(o)
      .forEach(key => { if(o[key] !== value) result[key] = o[key]; });
  return result;
};

export const removeNull = <T>(o: T) => removeValue(o, null)/*for convenience*/;
export const removeUndefined = <T>(o: T) => removeValue(o, undefined)/*for convenience*/;
