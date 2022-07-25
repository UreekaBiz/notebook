import { AttributeType, MarkName } from '@ureeka-notebook/web-service';

import { getMergedAttributeValueFromSelection, InvalidMergedAttributeValue } from 'notebookEditor/extension/util/attribute';
import { getSelectedNode } from 'notebookEditor/extension/util/node';
import { EditorToolComponentProps } from 'notebookEditor/toolbar/type';

import { UnitPickerInput } from './UnitPickerInput.tsx';

// ********************************************************************************
interface Props extends EditorToolComponentProps {/*no additional*/}
export const FontSizeToolItem: React.FC<Props> = ({ editor, depth }) => {
  const { state } = editor;
  const node = getSelectedNode(state, depth);
  if(!node) return null/*nothing to render*/;

  const mergedValue = getMergedAttributeValueFromSelection(state, AttributeType.FontSize, MarkName.TEXT_STYLE);
  const inputValue = mergedValue === InvalidMergedAttributeValue ? '' : mergedValue;

  // == Handlers ==================================================================
  const handleChange = (inputValue: string) => {
    editor.commands.setTextStyle(AttributeType.FontSize, inputValue);

    // Focus the editor again
    editor.commands.focus();
  };

  // == UI ========================================================================
  return (
    <UnitPickerInput name='Font Size' onChange={handleChange} valueWithUnit={inputValue ?? ''} />
  );
};
