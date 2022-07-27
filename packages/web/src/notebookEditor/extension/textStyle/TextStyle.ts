import { Mark } from '@tiptap/core';

import { AttributeType, TextStyleMarkSpec } from '@ureeka-notebook/web-service';

import { getMarkOutputSpec } from 'notebookEditor/extension/util/attribute';
import { isValidHTMLElement, safeParseTag } from 'notebookEditor/extension/util/parse';
import { NoStorage } from 'notebookEditor/model/type';

import { removeEmptyTextStyleCommand, setTextStyleCommand, unsetTextStyleCommand } from './command';

// ********************************************************************************
interface TextStyleOptions { HTMLAttributes: Record<string, any>; }

export const TextStyle = Mark.create<TextStyleOptions, NoStorage>({
  ...TextStyleMarkSpec,

  // -- Attribute -----------------------------------------------------------------
  addAttributes() {
    return {
      [AttributeType.FontSize]: {
        default: undefined,
        parseHTML: element => element.style.fontSize.replace(/['"]+/g, ''),
      },

      [AttributeType.TextColor]: {
        default: undefined,
        parseHTML: element => element.style.color.replace(/['"]+/g, ''),
      },
    };
  },
  addOptions() { return { HTMLAttributes: {} }; },

  // -- Command -------------------------------------------------------------------
  addCommands() {
    return {
      setTextStyle: setTextStyleCommand,
      unsetTextStyle: unsetTextStyleCommand,
      removeEmptyTextStyle: removeEmptyTextStyleCommand,
    };
  },

  // -- View ----------------------------------------------------------------------
  parseHTML() {
    return [{
      ...safeParseTag('span'),
      getAttrs: (element) => {
        if(!isValidHTMLElement(element)) return false/*nothing to do*/;

        return element.hasAttribute('style') ? {} : false/*no styles*/;
      },
    }];
  },
  renderHTML({ mark, HTMLAttributes }) { return getMarkOutputSpec(mark, HTMLAttributes); },
});
