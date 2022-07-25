// ********************************************************************************
// --------------------------------------------------------------------------------
export interface CodeBlockStyles {
  backgroundColor: string;
  hoverColor: string;
  borderColor: string;
  bodyFont: string;
}

export const CODE_BLOCK_DEFAULT_STYLES: CodeBlockStyles = {
  backgroundColor: '#EDF2F7',
  hoverColor: '#E2E8F0',
  borderColor: '#CBD5E0',
  bodyFont: '-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol";',
};

// --------------------------------------------------------------------------------
export interface CodeBlockReferenceStyles {
  borderColor: string;
  bodyFont: string;
}

export const CODE_BLOCK_REFERENCE_DEFAULT_STYLES: CodeBlockReferenceStyles = {
  borderColor: '#A0AEC0',
  bodyFont: '-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol";',
};

// --------------------------------------------------------------------------------
export interface ImageStyles {
  outlineColor: string;
  iconButtonHoverBackgroundColor: string;
  iconButtonActiveColor: string;
  iconButtonColor: string;
}

export const IMAGE_DEFAULT_STYLES: ImageStyles = {
  outlineColor: '#BDBDBD',
  iconButtonHoverBackgroundColor: 'rgba(0, 0, 0, 0.5)',
  iconButtonActiveColor: 'white',
  iconButtonColor: 'white',
};

// --------------------------------------------------------------------------------
export interface DrawingStyles {
  outlineColor: string;
  iconButtonHoverBackgroundColor: string;
  iconButtonActiveColor: string;
  iconButtonColor: string;
}

export const DRAWING_DEFAULT_STYLES: ImageStyles = {
  outlineColor: '#BDBDBD',
  iconButtonHoverBackgroundColor: 'rgba(0, 0, 0, 0.5)',
  iconButtonActiveColor: 'white',
  iconButtonColor: 'white',
};

// --------------------------------------------------------------------------------
export interface TitleStyles {
  borderColor: string;
  color: string;
  defaultFontSize: string;
  defaultFontWeight: string;
  defaultUnderlineColor: string;
  codeFont: string;
  display: string;
}

export const TITLE_DEFAULT_STYLES: TitleStyles = {
  borderColor: '#CBD5E0',
  color: '#05284C',
  defaultFontSize: '45px',
  defaultFontWeight: '900',
  defaultUnderlineColor: '#E2E8F0',
  codeFont: 'source-code-pro, Menlo, Monaco, Consolas, Courier New, monospace',
  display: 'block',
};
