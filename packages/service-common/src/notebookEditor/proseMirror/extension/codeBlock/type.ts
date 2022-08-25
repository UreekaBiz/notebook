// ********************************************************************************
// alias for the hash of the Content of a CodeBlock
export type CodeBlockHash = string;

// the attribute that ensures that VisualId for a CodeBlock appears
// to the right of the CodeBlock (SEE: index.css)
export const DATA_VISUAL_ID = 'data-visualid';

// the text that gets shown for Chips when the corresponding
// codeBlock gets removed, hence invalidating its visualId
export const REMOVED_CODEBLOCK_VISUALID = 'Removed';

// used as the hash when a CodeBlock is empty
export const EMPTY_CODEBLOCK_HASH = 'EmptyString';

export enum CodeBlockType { Text = 'Text', Code = 'Code'}
