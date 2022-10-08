import { getSelectedNode, isNodeSelection, isNodeType, AttributeType, NodeName, SetNodeSelectionDocumentUpdate, SetTextSelectionDocumentUpdate, UpdateSingleNodeAttributesDocumentUpdate } from '@ureeka-notebook/web-service';

import { applyDocumentUpdates } from 'notebookEditor/command/update';
import { EditorToolComponentProps } from 'notebookEditor/sidebar/toolbar/type';

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

  placeholder?: string;

  /** keep the focus on the ChipTool when a value is added. Defaults to true */
  keepFocus?: boolean;

  /** a function that validates if a label is valid for the Chip */
  validate: (label: string) => boolean;
  /** gets a valid value from the given label */
  getValueFromLabel: (label: string) => string;
  /** gets a valid label from the given value */
  getLabelFromValue: (value: string) => string;

  onChipClick?: (chip: ChipValue, index: number) => void;
}
export const ChipToolItem: React.FC<Props> = ({ editor, attributeType, depth, name, nodeName, validate, placeholder, keepFocus = true, getLabelFromValue, getValueFromLabel, onChipClick }) => {
  const { state } = editor;
  const { selection } = state;
  const { $anchor, anchor } = selection;
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
    const newValue = chips.length > 0 ? chips.map(chip => chip.value) : undefined/*no value*/;

    const nodeSelection = isNodeSelection(selection);
    const updatePos = isNodeSelection(selection)
      ? anchor
      : anchor - $anchor.parentOffset - 1/*select the Node itself*/;

    applyDocumentUpdates(editor, [
      new UpdateSingleNodeAttributesDocumentUpdate(nodeName as NodeName/*by definition*/, updatePos, { [attributeType]: newValue }),
      ...(nodeSelection ? [new SetNodeSelectionDocumentUpdate(anchor)] : [new SetTextSelectionDocumentUpdate({ from: anchor, to: anchor })]),
    ]);

    // focus the Editor again
    if(focus) editor.view.focus();
  };

  // == UI ========================================================================
  return (
    <InputToolItemContainer name={name} showRightContent={false}>
      <ChipTool
        nodeId={id}
        value={chips}
        validate={validate}
        placeholder={placeholder}
        keepFocus={keepFocus}
        onAddValue={handleAddValue}
        onChange={handleChange}
        onChipClick={onChipClick}
      />
    </InputToolItemContainer>
  );
};
