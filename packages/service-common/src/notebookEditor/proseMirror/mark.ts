// ********************************************************************************
export type JSONMark = {
  type: MarkName;
  attrs?: Record<string, any>;
};

// ================================================================================
export enum MarkName {
  BOLD = 'bold',
  TEXT_STYLE = 'textStyle',
}
