import { isCodeBlockReferenceNode, isNodeSelection, AttributeType, NodeName, VisualId } from '@ureeka-notebook/web-service';

import { getCodeBlockViewStorage } from 'notebookEditor/extension/codeblock/nodeView/storage';
import { focusCodeBlock } from 'notebookEditor/extension/codeblock/util';
import { ChipTool } from 'notebookEditor/extension/shared/component/chipTool/ChipTool';
import { EditorToolComponentProps } from 'notebookEditor/toolbar/type';

import { isValidCodeBlockReference, visualIdFromCodeBlockReference } from '../util';

// ********************************************************************************
interface Props extends EditorToolComponentProps {/*no additional*/}
export const CodeBlockReferenceChipSelector: React.FC<Props> = ({ editor }) => {
  const { selection } = editor.state;
  if(!isNodeSelection(selection) || !isCodeBlockReferenceNode(selection.node)) throw new Error('Invalid CodeBlockReferenceChipSelector render');

  const { attrs } = selection.node;
  const codeBlockReference = attrs[AttributeType.CodeBlockReference];
  let selectedChips: string[] = [];
  if(codeBlockReference) {
    const visualId = visualIdFromCodeBlockReference(editor, codeBlockReference);
    selectedChips = visualId ? [visualId] : [/*explicitly empty*/];
  } /* else -- do not modify default */

  // == Handler ===================================================================
  const handleChipsInputUpdate = (codeBlockVisualId: VisualId) => {
    const codeBlockReference = isValidCodeBlockReference(editor, codeBlockVisualId);
    if(!codeBlockReference.isValid) return false/*ignore call*/;

    const codeBlockViewStorage = getCodeBlockViewStorage(editor);
    const referencedCodeBlockId = codeBlockViewStorage.getCodeBlockId(codeBlockVisualId);
    if(!referencedCodeBlockId) return false/*ignore call*/;

    return editor.chain()
                 .focus()
                 .updateAttributes(NodeName.CODEBLOCK_REFERENCE, { ...attrs, codeBlockReference: referencedCodeBlockId })
                 .setNodeSelection(selection.$anchor.pos)
                 .run();
  };

  const handleChipClick = (codeBlockVisualId: VisualId) => {
    if(!attrs[AttributeType.CodeBlockReference]) return false/*ignore call*/;
    return focusCodeBlock(editor, codeBlockVisualId);
  };

  const handleChipDrop = () => {/*explicitly do nothing*/};

  const handleChipClose = () => {
    return editor.chain()
              .focus()
              .updateAttributes(NodeName.CODEBLOCK_REFERENCE, { ...attrs, codeBlockReference: undefined/*none*/ })
              .setNodeSelection(selection.$anchor.pos)
              .run();
  };

  // == UI ========================================================================
  return (
    <ChipTool
      nodeId={`${attrs[AttributeType.Id]}`}
      name='Referenced Code Block'
      width='100%'
      marginTop='10px'
      currentChips={selectedChips}
      updateChipsInputCallback={handleChipsInputUpdate}
      chipClickCallback={handleChipClick}
      chipDropCallback={handleChipDrop}
      chipCloseButtonCallback={handleChipClose}
    />
  );
};
