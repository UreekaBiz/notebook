import { Node as ProseMirrorNode, Schema } from 'prosemirror-model';

import { Attributes, AttributeType, AttributeValue } from '../attribute';
import { MarkName } from './type';

// ********************************************************************************
// gets the given Mark from the given Node. Returns `undefined` if the Mark is not found.
export const getMark = (node: ProseMirrorNode, markName: MarkName) => {
  return node.marks.find(mark => mark.type.name === markName);
};
// creates a mark
export const createMark = (markName: MarkName, schema: Schema, attrs?: Partial<Attributes>) => {
  return schema.marks[markName].create(attrs);
};

// gets the value of the Mark from the given Node. Returns `undefined` if the Mark
// is not found or the Mark has no value.
export const getMarkValue = (node: ProseMirrorNode, markName: MarkName, attributeType: AttributeType): AttributeValue | undefined=> {
  const mark = getMark(node, markName);
  const value = mark ? mark.attrs[attributeType] : undefined;

  return value;
};

// returns a string with the names of all allowed Marks for a Node
export const getAllowedMarks = (allowedMarks: MarkName[]) => allowedMarks.join(' ');
