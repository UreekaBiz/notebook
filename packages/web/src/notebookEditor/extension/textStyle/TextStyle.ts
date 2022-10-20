import { Mark } from '@tiptap/core';

import { getMarkOutputSpec, AttributeType, TextStyleMarkSpec } from '@ureeka-notebook/web-service';

import { isValidHTMLElement, safeParseTag } from 'notebookEditor/extension/util/parse';
import { NoOptions, NoStorage } from 'notebookEditor/model/type';

// ********************************************************************************
// == Constant ====================================================================
const replaceQuotesRegEx = /['"]+/g;

// == Mark ====================================================================
export const TextStyle = Mark.create<NoOptions, NoStorage>({
  ...TextStyleMarkSpec,

  // -- Attribute -----------------------------------------------------------------
  addAttributes() {
    // NOTE: not using setAttributeParsingBehavior since specific RegEx is used
    return {
      [AttributeType.FontSize]: { default: undefined/*none*/, parseHTML: (element) => element.style.fontSize.replace(replaceQuotesRegEx, '') },
      [AttributeType.Color]: { default: undefined/*none*/, parseHTML: (element) => element.style.color.replace(replaceQuotesRegEx, '') },
      [AttributeType.BackgroundColor]: { default: undefined/*none*/, parseHTML: (element) => element.style.backgroundColor.replace(replaceQuotesRegEx, '') },
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
