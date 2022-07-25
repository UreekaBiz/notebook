import { mergeAttributes, Mark } from '@tiptap/core';

import { AttributeType, TextStyleMarkSpec } from '@ureeka-notebook/web-service';

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
        default: null,
        parseHTML: element => element.style.fontSize.replace(/['"]+/g, ''),
        renderHTML: attributes => {
          if(!attributes.fontSize) return {};
          return { style: `font-size: ${attributes.fontSize}` };
        },
      },

      [AttributeType.TextColor]: {
        default: null,
        parseHTML: element => element.style.color.replace(/['"]+/g, ''),
        renderHTML: attributes => {
          if(!attributes.color) return {};
          return { style: `color: ${attributes.color}` };
        },
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
  renderHTML({ HTMLAttributes }) { return ['span', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0]; },
});
