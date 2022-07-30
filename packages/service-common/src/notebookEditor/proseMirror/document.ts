import { Node as ProseMirrorNode } from 'prosemirror-model';

import { DEFAULT_NOTEBOOK_NAME } from '../../notebook/type';

// ********************************************************************************
// TODO: More specificity than string (this is the JSON.stringified version of the
//       step / document)
export type NotebookDocumentContent = string/*TODO: see TODO above*/;

// ================================================================================
// the maximum number of characters in a Notebook name
// TODO: make a configuration parameter
const MAX_NOTEBOOK_NAME_LENGTH = 1024/*SEE: Notebook*/;

export const extractDocumentName = (document: ProseMirrorNode) => {
  // if there is a Title Node then retrieve its content otherwise take the
  // first 'n' chars of the content

  // TODO: implement!!!
  //const titleNode = document.firstChild;
  //if(titleNode?.type.name !== TITLE_NODE_NAME) { logger.error(`Invalid first child for (${DOC_NAME}) in Notebook (${version}; ${notebookId}). Expected (${TITLE_NODE_NAME}) but got (${titleNode?.type.name})`); return DEFAULT_NOTEBOOK_NAME/*nothing to do*/; }
  //const textNode = titleNode.firstChild;
  //if(textNode?.type.name !== TEXT_NAME) { logger.error(`Invalid first child for (${TITLE_NODE_NAME}) in Notebook (${version}; ${notebookId}). Expected (${TEXT_NAME}) but got (${textNode?.type.name})`); return DEFAULT_NOTEBOOK_NAME/*nothing to do*/; }
  //const name = textNode.text?.trim();
  //return name || DEFAULT_NOTEBOOK_NAME;

  // TODO: needs to be more complex to handle cases such as leading blanks, etc.
  const node = document.firstChild;
  if(!node) return DEFAULT_NOTEBOOK_NAME;
  return node.textContent.trim().substring(0, MAX_NOTEBOOK_NAME_LENGTH);
};
