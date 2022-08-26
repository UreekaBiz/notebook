import { Mark as ProseMirrorMark } from 'prosemirror-model';

import { Attributes } from '../attribute';
import { NotebookSchemaType } from '../schema';

// ********************************************************************************
export type JSONMark<A extends Attributes = {}> = {
  type: MarkName;

  // Attributes are not required in a mark and potentially not be present.
  attrs?: Partial<A>;
};

/** the Range covered by a Mark */
export type MarkRange = {
  mark: ProseMirrorMark;
  from: number;
  to: number;
}

// ================================================================================
export enum MarkName {
  BOLD = 'bold',
  ITALIC = 'italic',
  LINK = 'link',
  REPLACED_TEXT_MARK = 'replacedTextMark',
  STRIKETHROUGH = 'strikethrough',
  SUB_SCRIPT = 'subScript',
  SUPER_SCRIPT = 'superScript',
  TEXT_STYLE = 'textStyle',
}
export const getMarkName = (mark: ProseMirrorMark) => mark.type.name as MarkName;

// --------------------------------------------------------------------------------
export const markFromJSONMark = (schema: NotebookSchemaType, jsonMark: JSONMark) => ProseMirrorMark.fromJSON(schema, jsonMark);
export const stringifyMarksArray = (marks: ProseMirrorMark[]) => JSON.stringify(marks);
export const parseStringifiedMarksArray = (stringifiedMarks: string) => JSON.parse(stringifiedMarks) as JSONMark[]/*FIXME: handle exceptions!!!*/;
