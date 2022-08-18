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
  styles: { global: {/*currently nothing*/} },
});
