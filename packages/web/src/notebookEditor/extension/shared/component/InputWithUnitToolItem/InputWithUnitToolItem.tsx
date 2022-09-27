import { getSelectedNode, isNodeSelection, isNodeType, AttributeType, InvalidMergedAttributeValue, MarkName, NodeName } from '@ureeka-notebook/web-service';

import { getTextDOMRenderedValue } from 'notebookEditor/extension/util/attribute';
import { EditorToolComponentProps } from 'notebookEditor/sidebar/toolbar/type';

import { InputWithUnitTool } from './InputWithUnitTool';

// ********************************************************************************
// == Node ========================================================================
interface InputWithUnitNodeToolItemProps extends EditorToolComponentProps {
  nodeName: NodeName;

  /** the attribute that this ToolItems corresponds to */
  attributeType: AttributeType;

  /** the name of the ToolItem */
  name: string;

  minValue?: number;
  maxValue?: number;
}
export const InputWithUnitNodeToolItem: React.FC<InputWithUnitNodeToolItemProps> = ({ editor, attributeType, depth, name, nodeName, minValue, maxValue }) => {
  const { state } = editor;
  const { selection } = state;
  const node = getSelectedNode(state, depth);
  if(!node || !isNodeType(node, nodeName)) return null/*nothing to render - invalid node render*/;

  const value = node.attrs[attributeType] ?? '' /*default*/;

  // -- Handler -------------------------------------------------------------------
  const handleChange = (value: string, focus?: boolean) => {
    editor.commands.updateAttributes(nodeName, { [attributeType]: value });

    const position = state.selection.anchor;
    // set the selection in the same position in case that the node was replaced
    if(isNodeSelection(selection)) editor.commands.setNodeSelection(position);
    else editor.commands.setTextSelection(position);

    // Focus the editor again
    if(focus) editor.commands.focus();
  };

  // -- UI ------------------------------------------------------------------------
  // NOTE: Not using InputToolItemContainer at this level since InputWithUnitTool
  //       requires to have access to the UnitPicker which will be the right side
  //       content of the InputToolItemContainer.
  return <InputWithUnitTool name={name} value={value} minValue={minValue} maxValue={maxValue} onChange={handleChange}/>;
};

// == Mark ========================================================================
interface InputWithUnitMarkToolItemProps extends EditorToolComponentProps {
  markName: MarkName;

  /** the attribute that this ToolItems corresponds to */
  attributeType: AttributeType;

  /** the name of the ToolItem */
  name: string;

  minValue?: number;
  maxValue?: number;
}
export const InputWithUnitMarkToolItem: React.FC<InputWithUnitMarkToolItemProps> = ({ editor, attributeType, markName, name, minValue, maxValue }) => {
  const domRenderValue = getTextDOMRenderedValue(editor, attributeType, markName);
  // get a valid render value for the input
  const inputValue = String((domRenderValue === InvalidMergedAttributeValue ? '' : domRenderValue) ?? '');

  // -- Handler -------------------------------------------------------------------
  const handleChange = (value: string, focus?: boolean) => {
    editor.commands.setMark(markName, { [attributeType]: value });

    // NOTE: No need to manually focus the position again since it's a mark update
    // Focus the editor again
    if(focus) editor.commands.focus();
  };

  // -- UI ------------------------------------------------------------------------
  // NOTE: Not using InputToolItemContainer at this level since InputWithUnitTool
  //       requires to have access to the UnitPicker which will be the right side
  //       content of the InputToolItemContainer.
  return <InputWithUnitTool name={name} value={inputValue} minValue={minValue} maxValue={maxValue} onChange={handleChange}/>;
};
