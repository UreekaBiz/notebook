import { getLogger, AttributeType, Logger, NodeName, REMOVED_CODEBLOCK_VISUALID } from '@ureeka-notebook/web-service';

import { focusCodeBlock, visualIdFromCodeBlockReference } from 'notebookEditor/extension/codeblock/util';
import { ChipValue } from 'notebookEditor/extension/shared/component/chipTool/Chip';
import { ChipToolItem } from 'notebookEditor/extension/shared/component/chipTool/ChipToolItem';
import { EditorToolComponentProps } from 'notebookEditor/toolbar/type';

import { isValidCodeBlockReference } from '../util';

const log = getLogger(Logger.NOTEBOOK);

// ********************************************************************************
// NOTE: This component is meant to be used with nodes that requires multiple
//       references to be selected.
interface Props extends EditorToolComponentProps {
  nodeName: NodeName;
}
export const CodeBlockReferencesChipSelector: React.FC<Props> = ({ editor, ...props }) => {
  // SEE: CodeBlockReferenceChipSelector.tsx
  const getValueFromLabel = (visualId: string) => {
    const codeBlockReference = isValidCodeBlockReference(editor, visualId);
    if(!codeBlockReference.isValid) return ''/*invalid empty string*/;
    const codeBlockView = codeBlockReference.codeBlockView,
          codeBlock = codeBlockView.node,
          codeBlockAttributes = codeBlock.attrs,
          codeBlockId = codeBlockAttributes[AttributeType.Id];
    // log the error but return the empty string
    if(!codeBlockId) log.error('CodeBlockReferencesChipSelector: codeBlockId is missing in visualId: ', visualId);
    return codeBlockId ?? '';
  };

  // SEE: CodeBlockReferenceChipSelector.tsx
  const getLabelFromValue = (codeBlockReference: string) =>
    visualIdFromCodeBlockReference(editor, codeBlockReference) ?? REMOVED_CODEBLOCK_VISUALID;

  // SEE: CodeBlockReferenceChipSelector.tsx
  /** validates if the visual id is valid for the chip */
  const validate = (visualId: string): boolean => {
    const codeBlockReference = isValidCodeBlockReference(editor, visualId/*visual id*/);
    return codeBlockReference.isValid;
  };

  // SEE: CodeBlockReferenceChipSelector.tsx
  const handleChipClick = (chip: ChipValue) => focusCodeBlock(editor, chip.label/*visual id*/);

  // == UI ========================================================================
  return (
    <ChipToolItem
      {...props}
      name='References'
      attributeType={AttributeType.CodeBlockReferences}
      editor={editor}
      getLabelFromValue={getLabelFromValue}
      getValueFromLabel={getValueFromLabel}
      validate={validate}
      onChipClick={handleChipClick}
    />
  );
};
