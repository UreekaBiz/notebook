import { Editor } from '@tiptap/core';

import { hashString, isBlank, isCodeBlockNode, CodeBlockNodeType, CodeBlockReference, NodeName, EMPTY_CODEBLOCK_HASH, REMOVED_CODEBLOCK_VISUALID } from '@ureeka-notebook/web-service';

import { getCodeBlockViewStorage } from 'notebookEditor/extension/codeblock/nodeView/storage';
import { visualIdFromCodeBlockReference } from 'notebookEditor/extension/codeblock/util';

// ********************************************************************************
// == Content =====================================================================
// get the combined content of all CodeBlocks referenced by the given
// CodeBlockReference array
export const getCodeBlocksContent = (editor: Editor, codeBlockReferences: CodeBlockReference[]) => {
  const codeBlockViewStorage = getCodeBlockViewStorage(editor);

  const codeBlocksContent = codeBlockReferences.map(codeBlockReference => {
    const codeBlockView = codeBlockViewStorage.getNodeView(codeBlockReference);
    if(!codeBlockView) return undefined/*no node view*/;
    const { node } = codeBlockView;
    return node.textContent ?? '';
  });

  // FIXME: Do we want this as a delimiter?
  const content = codeBlocksContent.filter(value => value !== undefined).join('\n');
  return content;
};

// check if all CodeBlocks referenced by the given CodeBlockReference array
// are empty. Leave as early as possible.
export const areCodeBlocksEmpty = (editor: Editor, codeBlockReferences: CodeBlockReference[]) => {
  const codeBlockViewStorage = getCodeBlockViewStorage(editor);

  for(let i=0; i<codeBlockReferences.length; i++) {
    const codeBlockView = codeBlockViewStorage.getNodeView(codeBlockReferences[i]);
    if(!codeBlockView) continue/*no node view*/;

    const { node } = codeBlockView;
    if(node.textContent.length > 0) return false/*at least one CodeBlock has content*/;
  }

  return true/*all of the CodeBlocks are empty*/;
};

// == Visual Id ===================================================================
// Gets the visual ids from the code block references given.
// NOTE: The order and duplicated values are preserved.
export const visualIdsFromCodeBlockReferences = (editor: Editor, codeBlockReferences: CodeBlockReference[]) => {
  const visualIds = codeBlockReferences.map(codeBlockReference => {
    const visualId = visualIdFromCodeBlockReference(editor, codeBlockReference);
    if(!visualId) return REMOVED_CODEBLOCK_VISUALID/*codeBlockReference got removed*/;
    return visualId;
  });

  return visualIds;
};

// == Hash ========================================================================
// Gets the hashes from the code block references given.
// NOTE: The order and duplicated values are preserved.
export const hashesFromCodeBlockReferences = (editor: Editor, codeBlockReferences: CodeBlockReference[]) => {
  const newCodeBlockHashes = codeBlockReferences.map(codeBlockReference => hashFromCodeBlockReference(editor, codeBlockReference));

  return newCodeBlockHashes;
};

// return a Hash given a CodeBlockReference
const hashFromCodeBlockReference = (editor: Editor, codeBlockReference: CodeBlockReference) => {
  const codeBlockStorage = getCodeBlockViewStorage(editor),
        codeBlockView = codeBlockStorage.getNodeView(codeBlockReference);
  if(!codeBlockView) throw new Error(`Referenced Code Block no longer exists.`)/*displayed as a Toast by React*/;
  if(!isCodeBlockNode(codeBlockView.node))  throw new Error(`codeBlockReference (${codeBlockReference}) is not a ${NodeName.CODEBLOCK} node.`);

  return codeBlockHash(codeBlockView.node);
};

// compute the Hash of a CodeBlock's textContent, or return the default
// empty CodeBlock Hash if it is empty
export const codeBlockHash = (node: CodeBlockNodeType) => {
  let { textContent } = node;
  return isBlank(textContent) ? EMPTY_CODEBLOCK_HASH : hashString(textContent);
};
