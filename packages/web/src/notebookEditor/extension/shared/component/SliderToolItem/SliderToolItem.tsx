import { isNodeSelection } from '@tiptap/core';
import { getSelectedNode, isNodeType, AttributeType, NodeName } from '@ureeka-notebook/web-service';

import { EditorToolComponentProps } from 'notebookEditor/sidebar/toolbar/type';

import { SliderTool } from './SliderTool';

// ********************************************************************************
// == Component ===================================================================
interface Props extends EditorToolComponentProps {
  /** the NodeName of the Node */
  nodeName: NodeName;
  /** the attribute that this ToolItems corresponds to */
  attributeType: AttributeType;

  /** the name of the ToolItem */
  name: string;

  /** the range of the Slider */
  minValue: number;
  maxValue: number;

  /** the increments for the step in the Slider */
  step: number;

  /** the decimals that the number will be round to */
  fixedDecimals?: number;
}
export const SliderToolItem: React.FC<Props> = ({ editor, depth, attributeType, fixedDecimals = 0, minValue, maxValue, name, nodeName, step }) => {
  const { state } = editor;
  const { selection } = state;
  const node = getSelectedNode(state, depth);
  if(!node || !isNodeType(node, nodeName)) return null /*nothing to render - invalid node render*/;

  // == Handler ===================================================================
  const handleChange = (value: number, focus?: boolean) => {
    editor.commands.updateAttributes(nodeName, { [attributeType]: value });

    const position = state.selection.anchor;
    // set the selection in the same position in case that the node was replaced
    if(isNodeSelection(selection)) editor.commands.setNodeSelection(position);
    else editor.commands.setTextSelection(position);

    // Focus the editor again
    if(focus) editor.commands.focus();
  };

  // == UI ========================================================================
  const value = node.attrs[attributeType] ?? minValue /*default*/;
  return (
    <SliderTool
      name={name}
      value={value}
      step={step}
      fixedDecimals={fixedDecimals}
      minValue={minValue}
      maxValue={maxValue}
      onChange={handleChange}
    />
  );
};
