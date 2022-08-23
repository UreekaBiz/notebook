import { AttributeType, MarkName, InvalidMergedAttributeValue } from '@ureeka-notebook/web-service';

import { getTextDOMRenderedValue } from 'notebookEditor/extension/util/attribute';
import { EditorToolComponentProps } from 'notebookEditor/toolbar/type';

import { InputWithUnitTool } from './InputWithUnitTool';

// ********************************************************************************
interface Props extends EditorToolComponentProps {
  markName: MarkName;

  /** the attribute that this ToolItems corresponds to */
  attributeType: AttributeType;

  /** the name of the ToolItem */
  name: string;
}
export const InputWithUnitToolItem: React.FC<Props> = ({ editor, attributeType, markName, name }) => {
  const domRenderValue = getTextDOMRenderedValue(editor, AttributeType.FontSize, markName);
  // get a valid render value for the input
  const inputValue = String((domRenderValue === InvalidMergedAttributeValue ? '' : domRenderValue) ?? '');

  // == Handler ===================================================================
  const handleChange = (value: string, focus?: boolean) => {
    editor.commands.setTextStyle(attributeType, value);

    // NOTE: No need to manually focus the position again since the position will be
    //       the same.
    // Focus the editor again
    if(focus) editor.commands.focus();
  };

  // == UI ========================================================================
  // NOTE: Not using InputToolItemContainer at this level since InputWithUnitTool
  //       requires to have access to the UnitPicker which will be the right side
  //       content of the InputToolItemContainer.
  return <InputWithUnitTool name={name} value={inputValue} onChange={handleChange}/>;
};
