import { Editor } from '@tiptap/core';

import { CodeBlockReference, VisualId } from '@ureeka-notebook/web-service';

import { getCodeBlockViewStorage } from 'notebookEditor/extension/codeblock/nodeView/storage';

import { CodeBlockController } from '../codeblock/nodeView/controller';

// ********************************************************************************
// ================================================================================
export const focusCodeBlock = (editor: Editor, codeBlockVisualId: VisualId) => {
  const codeBlockReference = isValidCodeBlockReference(editor, codeBlockVisualId);
  if(!codeBlockReference.isValid) return false/*ignore call*/;

  const { codeBlockView } = codeBlockReference;
  return editor.commands.focus(codeBlockView.getPos() + 1/*inside the CodeBlock*/ + codeBlockView.node.textContent.length/*at the end of its content*/, { scrollIntoView: true/*scroll into view*/ });
};

// == Visual Id ===================================================================
export const visualIdFromCodeBlockReference = (editor: Editor, codeBlockReference: CodeBlockReference) => {
  const codeBlockStorage = getCodeBlockViewStorage(editor),
        codeBlockView = codeBlockStorage.getNodeView(codeBlockReference);

  if(!codeBlockView) return;
  /* else -- codeBlock still exists, return its visualId */

  return codeBlockStorage.getVisualId(codeBlockReference);
};

type ValidCodeBlockReference = Readonly<{ isValid: false; } | { isValid: true; codeBlockView: CodeBlockController; }>;
export const isValidCodeBlockReference = (editor: Editor, visualId: VisualId): ValidCodeBlockReference => {
  const codeBlockStorage = getCodeBlockViewStorage(editor);

  const referencedCodeBlockId = codeBlockStorage.getCodeBlockId(visualId);
  if(!referencedCodeBlockId) return { isValid: false/*codeBlockId for visualId does not exist*/ };

  const referencedCodeBlockView = codeBlockStorage.getNodeView(referencedCodeBlockId);
  if(referencedCodeBlockView) return { isValid: true, codeBlockView: referencedCodeBlockView };
  // else -- codeBlockView don't exists

  return { isValid: false };
};
