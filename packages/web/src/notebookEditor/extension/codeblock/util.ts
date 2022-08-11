import { Editor } from '@tiptap/core';

import { VisualId } from '@ureeka-notebook/web-service';

import { isValidCodeBlockReference } from 'notebookEditor/extension/codeBlockReference/util';

// ********************************************************************************
export const focusCodeBlock = (editor: Editor, codeBlockVisualId: VisualId) => {
  const codeBlockReference = isValidCodeBlockReference(editor, codeBlockVisualId);
  if(!codeBlockReference.isValid) return false/*ignore call*/;

  const { codeBlockView } = codeBlockReference;
  return editor.commands.focus(codeBlockView.getPos() + 1/*inside the CodeBlock*/ + codeBlockView.node.textContent.length/*at the end of its content*/, { scrollIntoView: true/*scroll into view*/ });
};
