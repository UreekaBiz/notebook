import { Mark } from '@tiptap/core';

import { getMarkOutputSpec, AttributeType, TextStyleMarkSpec } from '@ureeka-notebook/web-service';

import { isValidHTMLElement, safeParseTag } from 'notebookEditor/extension/util/parse';
import { NoOptions, NoStorage } from 'notebookEditor/model/type';

// ********************************************************************************
export const TextStyle = Mark.create<NoOptions, NoStorage>({
  ...TextStyleMarkSpec,

  // -- Attribute -----------------------------------------------------------------
  addAttributes() {
    return {
      [AttributeType.FontSize]: {
        default: undefined,
        parseHTML: element => element.style.fontSize.replace(/['"]+/g, ''),
      },

      [AttributeType.Color]: {
        default: undefined,
        parseHTML: element => element.style.color.replace(/['"]+/g, ''),
      },
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
