import { Editor } from '@tiptap/core';

import { AttributeType, CodeBlockReference, VisualId, REMOVED_CODEBLOCK_VISUALID, SetTextSelectionDocumentUpdate } from '@ureeka-notebook/web-service';

import { getCodeBlockViewStorage } from 'notebookEditor/extension/codeblock/nodeView/storage';

import { CodeBlockController } from '../codeblock/nodeView/controller';

// ********************************************************************************
// == Visual Id ===================================================================
// return the VisualId for a CodeBlock given its Reference (Id)
export const visualIdFromCodeBlockReference = (editor: Editor, codeBlockReference: CodeBlockReference) => {
  const codeBlockStorage = getCodeBlockViewStorage(editor),
        codeBlockView = codeBlockStorage.getNodeView(codeBlockReference);

  if(!codeBlockView) return REMOVED_CODEBLOCK_VISUALID;
  /* else -- codeBlock still exists, return its visualId */

  return codeBlockStorage.getVisualId(codeBlockReference);
};

type ValidCodeBlockReference = Readonly<{ isValid: false; } | { isValid: true; codeBlockView: CodeBlockController; }>;
// check if a CodeBlockReference references a CodeBlock that still exists
// and thus has a valid VisualId
export const isValidCodeBlockReference = (editor: Editor, visualId: VisualId): ValidCodeBlockReference => {
  const codeBlockStorage = getCodeBlockViewStorage(editor);

  const referencedCodeBlockId = codeBlockStorage.getCodeBlockId(visualId);
  if(!referencedCodeBlockId) return { isValid: false/*codeBlockId for visualId does not exist*/ };

  const referencedCodeBlockView = codeBlockStorage.getNodeView(referencedCodeBlockId);
  if(referencedCodeBlockView) return { isValid: true, codeBlockView: referencedCodeBlockView };
  // else -- codeBlockView don't exists

  return { isValid: false };
};

// == Util ========================================================================
// focus a CodeBlock at the end of its convent given its Visual Id
export const focusCodeBlock = (editor: Editor, codeBlockVisualId: VisualId) => {
  const codeBlockReference = isValidCodeBlockReference(editor, codeBlockVisualId);
  if(!codeBlockReference.isValid) return false/*ignore call*/;

  const { codeBlockView } = codeBlockReference;
  const focusPos = codeBlockView.getPos() + 1/*inside the CodeBlock*/ + codeBlockView.node.textContent.length/*at the end of its content*/;
  const updatedTr = new SetTextSelectionDocumentUpdate({ from: focusPos, to: focusPos }).update(editor.state, editor.state.tr);
        updatedTr.scrollIntoView();
  editor.view.dispatch(updatedTr);
  editor.view.focus();

  return true/*focused*/;
};

// -- Chip Selectors --------------------------------------------------------------
export const getValueFromLabel = (editor: Editor, visualId: string) => {
  const codeBlockReference = isValidCodeBlockReference(editor, visualId);
  if(!codeBlockReference.isValid) return ''/*invalid empty string*/;
  const codeBlockView = codeBlockReference.codeBlockView,
        codeBlock = codeBlockView.node,
        codeBlockAttributes = codeBlock.attrs,
        codeBlockId = codeBlockAttributes[AttributeType.Id];
  // log the error but return the empty string
  return codeBlockId ?? '';
};

// SEE: CodeBlockReferencesChipSelector.tsx
export const getLabelFromValue = (editor: Editor, codeBlockReference: string) =>
  visualIdFromCodeBlockReference(editor, codeBlockReference) ?? REMOVED_CODEBLOCK_VISUALID;

// SEE: CodeBlockReferencesChipSelector.tsx
/** validates if the visual id is valid for the chip */
export const validateChip = (editor: Editor, visualId: string): boolean => {
  const codeBlockReference = isValidCodeBlockReference(editor, visualId/*visual id*/);
  return codeBlockReference.isValid;
};
