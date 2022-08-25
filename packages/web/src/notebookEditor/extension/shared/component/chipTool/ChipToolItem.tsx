import { getSelectedNode, isNodeSelection, isNodeType, AttributeType, NodeName } from '@ureeka-notebook/web-service';

import { EditorToolComponentProps } from 'notebookEditor/toolbar/type';

import { InputToolItemContainer } from '../InputToolItemContainer';
import { ChipValue } from './Chip';
import { ChipTool } from './ChipTool';

// ********************************************************************************
interface Props extends EditorToolComponentProps {
  nodeName: NodeName;

  /** the attribute that this ToolItems corresponds to */
  attributeType: AttributeType;

  /** the name of the ToolItem */
  name: string;

  /** a function that validates if a label is valid for the Chip */
  validate: (label: string) => boolean;
  /** gets a valid value from the given label */
  getValueFromLabel: (label: string) => string;
  /** gets a valid label from the given value */
  getLabelFromValue: (value: string) => string;

  onChipClick?: (chip: ChipValue, index: number) => void;
}
export const ChipToolItem: React.FC<Props> = ({ editor, attributeType, depth, name, nodeName, validate, getLabelFromValue, getValueFromLabel, onChipClick }) => {
  const { state } = editor;
  const { selection } = state;
  const node = getSelectedNode(state, depth);
  if(!node || !isNodeType(node, nodeName)) return null/*nothing to render - invalid node render*/;

  const value = (node.attrs[attributeType] ?? [] /*default*/) as string[],
        id = node.attrs[AttributeType.Id] ?? ''/*no id by default*/;
  const chips = value.map(chip => ({ label: getLabelFromValue(chip), value: chip }));

  // == Handler ===================================================================
  const handleAddValue = (label: string, focus?: boolean) => {
    const newValue: ChipValue = { label, value: getValueFromLabel(label) };
    handleChange([...chips, newValue]);
  };

  const handleChange = (chips: ChipValue[], focus?: boolean) => {
    const newValue = chips.map(chip => chip.value);
    editor.chain().focus().updateAttributes(nodeName, { [attributeType]: newValue }).run();

    const position = state.selection.anchor;
    // set the selection in the same position in case that the node was replaced
    if(isNodeSelection(selection)) editor.commands.setNodeSelection(position);
    else editor.commands.setTextSelection(position);

    // Focus the editor again
    if(focus) editor.commands.focus();
  };

  // == UI ========================================================================
  return (
    <InputToolItemContainer name={name} showRightContent={false}>
      <ChipTool
        nodeId={id}
        value={chips}
        validate={validate}
        onAddValue={handleAddValue}
        onChange={handleChange}
        onChipClick={onChipClick}
      />
    </InputToolItemContainer>
  );
};
