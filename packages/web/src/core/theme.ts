import { extendTheme } from '@chakra-ui/react';

// ********************************************************************************
export const EDITOR_CLASS_NAME = 'Editor';
export const EDITOR_EDITABLE_CLASS_NAME = 'Editor--editable';
export const EDITOR_PREVIEW_CLASS_NAME = 'Editor--preview';

export const DEFAULT_H1_COLOR = '#1C5987';
export const DEFAULT_H2_COLOR = '#4E7246';
export const DEFAULT_H3_COLOR = '#89B181';

// ================================================================================
export const theme = extendTheme({
  fonts: { code:'source-code-pro, Menlo, Monaco, Consolas, Courier New, monospace' },

  styles: {
    global: {

      // --- HTML Tags ------------------------------------------------------------
      code: {
        borderRadius:'5',
        display: 'fit-content',
        fontFamily: 'Menlo, Consolas, monospace',
        fontSize:'0.845em' /*T&E. This value is meant to match the size of the default font*/,

        /**
         * NOTE: This minWidth makes it so that empty CodeBlockContents can be used and
         * the cursor does not disappear when set inside of them (like paragraphs)
         * This is a CSS fix for the following issue
         *
         * REF: https://github.com/ueberdosis/tiptap/issues/911
         */
        div: { minWidth: '1px' },
      },

      a: {
        color: '#3b5fc0',
        textDecoration: 'underline',
        cursor: 'auto',
      },

      img: {
        height: 'auto',
        maxWidth: '100%',
        maxHeight: '100%',
      },
    },
  },
});
