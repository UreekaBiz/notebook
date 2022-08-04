import { extendTheme } from '@chakra-ui/react';

// ********************************************************************************
export const EDITOR_CLASS_NAME = 'Editor';

export const DEFAULT_H1_COLOR = '#1C5987';
export const DEFAULT_H2_COLOR = '#4E7246';
export const DEFAULT_H3_COLOR = '#89B181';

// ================================================================================
export const theme = extendTheme({
  fonts: { code:'source-code-pro, Menlo, Monaco, Consolas, Courier New, monospace' },

  styles: {
    global: {

      // --- HTML Tags ------------------------------------------------------------
      blockquote: {
        borderLeft: '2px solid #CECCCC',
        paddingLeft: '1rem',
      },

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

      /*horizontal alignments*/
      '&.left': { /*currently nothing*/ },
      '&.center': { ml: 'auto', mr: 'auto' },
      '&.right': { ml: 'auto' },
      '&.justify': { /*currently nothing*/ },

      hr: {
        borderTop: '1px solid #CECCCC',
        mt:'2',
        mb:'2',
      },

      // --- Editor Specific ------------------------------------------------------
      // [`.${EDITOR_CLASS_NAME} > div`]: { fontSize: TEXT_STYLE_DEFAULT_PARAGRAPH_FONT_SIZE, fontWeight: 400, my:4 },
      // [`.${EDITOR_CLASS_NAME} > ul, .${EDITOR_CLASS_NAME} > ol`]: { my:4 },
      // [`.${EDITOR_CLASS_NAME}`]: { p: 4, fontSize: TEXT_STYLE_DEFAULT_PARAGRAPH_FONT_SIZE, outline: 'none' },

      // --- Bullet List Specific -------------------------------------------------
      ul: { pl: 6, listStyleType: 'none' },

      // --- Ordered List Specific ------------------------------------------------
      ol: { pl: 6 },

      // --- Task List Specific ---------------------------------------------------
      'li[data-checked]': {
        display: 'flex',
        gap: '0.5rem',
      },
      'li[data-checked] > div': {
        flex: '1 1',
      },
      'li[data-checked] > div > p': {
        width: '100%',
      },
      'li[data-checked="true"] > div > p:first-child': {
        paddingTop: '0px',
        paddingBottom: '0px',
        textDecoration: 'line-through',
      },
    },
  },
});
