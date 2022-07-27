import { Command, getMarkAttributes } from '@tiptap/core';

import { AttributeType, CommandFunctionType, MarkName } from '@ureeka-notebook/web-service';

// ********************************************************************************
// NOTE: ambient module to ensure command is TypeScript-registered for TipTap
declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    [MarkName.TEXT_STYLE/*Expected and guaranteed to be unique. (SEE: /notebookEditor/model/node)*/]: {
      setTextStyle: CommandFunctionType<typeof setTextStyleCommand, ReturnType>;
      unsetTextStyle: CommandFunctionType<typeof unsetTextStyleCommand, ReturnType>;
      removeEmptyTextStyle: CommandFunctionType<typeof removeEmptyTextStyleCommand, ReturnType>;
    };
  }
}

// --------------------------------------------------------------------------------
export const setTextStyleCommand = (property: AttributeType, value: string): Command => ({ chain }) =>
  chain().setMark('textStyle', { [property]: value }).run();

export const unsetTextStyleCommand = (property: AttributeType): Command => ({ chain }) =>
  chain().setMark('textStyle', { [property]: null/*clear*/ }).run();

export const removeEmptyTextStyleCommand = (): Command => ({ state, commands }) => {
  const attributes = getMarkAttributes(state, MarkName.TEXT_STYLE);
  const hasStyles = Object.entries(attributes).some(([, value]) => !!value);
  if(hasStyles) return false;

  return commands.unsetMark(MarkName.TEXT_STYLE);
};
