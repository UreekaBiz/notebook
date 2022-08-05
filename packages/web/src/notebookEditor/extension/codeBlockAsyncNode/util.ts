import { Editor } from '@tiptap/core';
import { NodeSelection } from 'prosemirror-state';

import { hashString, isBlank, isCodeBlockNode, AttributeType, CodeBlockAsyncNodeAttributes, CodeBlockAsyncNodeType, CodeBlockNodeType, CodeBlockReference, NodeIdentifier, NodeName, REMOVED_CODEBLOCK_VISUALID } from '@ureeka-notebook/web-service';

import { getCodeBlockViewStorage } from 'notebookEditor/extension/codeblock/nodeView/storage';
import { EMPTY_CODEBLOCK_HASH } from 'notebookEditor/extension/codeblock/type';
import { HISTORY_META } from 'notebookEditor/extension/history/History';
import { resolveNewSelection } from 'notebookEditor/extension/util/node';

// ********************************************************************************
// == Async =======================================================================
export const replaceInlineCodeBlockAsyncNode = (editor: Editor, newAsyncNode: CodeBlockAsyncNodeType, replacementPosition: number) =>
  editor.chain()
        .command(({ tr }) => {
          const replacedNodePos = tr.doc.resolve(replacementPosition);
                tr.setSelection(new NodeSelection(replacedNodePos))
                  .replaceSelectionWith(newAsyncNode)
                  .setSelection(resolveNewSelection(editor.state.selection, tr));
          return true/*successfully replaced async node*/;
        })
        .setMeta(HISTORY_META, false/*once executed, an async node cannot go back to non-executed*/)
        .run();

// == Visual Id ===================================================================
// Gets the visual ids from the code block references given.
// NOTE: The order and duplicated values are preserved.
export const visualIdsFromCodeBlockReferences = (editor: Editor, codeBlockReferences: CodeBlockReference[]) => {
  const visualIds = codeBlockReferences.map(codeBlockReference => visualIdFromCodeBlockReference(editor, codeBlockReference));

  return visualIds;
};

export const visualIdFromCodeBlockReference = (editor: Editor, codeBlockReference: CodeBlockReference) => {
  const codeBlockStorage = getCodeBlockViewStorage(editor),
        codeBlockView = codeBlockStorage.getNodeView(codeBlockReference);
  if(!codeBlockView) {
    return REMOVED_CODEBLOCK_VISUALID;
  }/* else -- codeBlock still exists, return its visualId */

  return codeBlockStorage.getVisualId(codeBlockReference);
};

// == Hash ========================================================================
// Gets the hashes from the code block references given.
// NOTE: The order and duplicated values are preserved.
export const hashesFromCodeBlockReferences = (editor: Editor, codeBlockReferences: CodeBlockReference[]) => {
  const newCodeBlockHashes = codeBlockReferences.map(codeBlockReference => hashFromCodeBlockReference(editor, codeBlockReference));

  return newCodeBlockHashes;
};

const hashFromCodeBlockReference = (editor: Editor, codeBlockReference: CodeBlockReference) => {
  const codeBlockStorage = getCodeBlockViewStorage(editor),
        codeBlockView = codeBlockStorage.getNodeView(codeBlockReference);
  if(!codeBlockView) throw new Error(`${NodeName.CODEBLOCK} (${codeBlockReference}) no longer exists.`);
  if(!isCodeBlockNode(codeBlockView.node))  throw new Error(`codeBlockReference (${codeBlockReference}) is not a ${NodeName.CODEBLOCK} node.`);

  return codeBlockHash(codeBlockView.node);
};

export const codeBlockHash = (node: CodeBlockNodeType) => {
  let { textContent } = node;
  return isBlank(textContent) ? EMPTY_CODEBLOCK_HASH : hashString(textContent);
};

// ================================================================================
type ValidCodeBlockReference = Readonly<{ isValid: false; } | { isValid: true; codeBlockId: NodeIdentifier; }>;
export const isValidCodeBlockReference = (editor: Editor, attrs: CodeBlockAsyncNodeAttributes, visualId: string): ValidCodeBlockReference => {
  const codeBlockReferences = attrs[AttributeType.CodeBlockReferences];

  if(!codeBlockReferences || codeBlockReferences.includes(visualId)) return { isValid: false }/*already included or codeBlockReferences don't exists*/;

  const codeBlockStorage = getCodeBlockViewStorage(editor);
  const referencedCodeBlockId = codeBlockStorage.getCodeBlockId(visualId);
  if(referencedCodeBlockId) return { isValid: true, codeBlockId: referencedCodeBlockId };
  // else -- codeBlockId don't exists

  return { isValid: false };
};

