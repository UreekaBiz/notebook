import { getSelectedNode, isNodeType, AttributeType, NodeName } from '@ureeka-notebook/web-service';

import { EditorToolComponentProps } from 'notebookEditor/toolbar/type';

import { SliderMarkValue, SliderTool } from './SliderTool';

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

  /** an array of SliderMarkValue */
  markValues: SliderMarkValue[];
  /** the increments for the step in the Slider */
  step: number;
}
export const SliderToolItem: React.FC<Props> = ({ editor, depth, attributeType, minValue, maxValue, markValues, name, nodeName }) => {
  const { state } = editor;
  const node = getSelectedNode(state, depth);
  if(!node || !isNodeType(node, nodeName)) return null /*nothing to render - invalid node render*/;

  // == Handler ===================================================================
  const handleChange = (normalizedValue: number) => {
    // gets the actual value from the normalized value
    const parsedValue = normalizedValue * (maxValue - minValue) / 100 + minValue;
    editor.commands.updateAttributes(nodeName, { [attributeType]: parsedValue/*turns sliderValue to ms*/ });

    // Focus the editor again
    editor.commands.focus();
  };

  // == UI ========================================================================
  const value = node.attrs[attributeType] ?? minValue /*default*/;
  // normalize the value to be between 0 and 100
  const normalized = (value - minValue) / (maxValue - minValue) * 100;
  console.log(normalized);
  return (
    <SliderTool
      name={name}
      value={normalized}
      step={10}
      sliderMarkValues={markValues}
      onChange={handleChange}
    />
  );
};
