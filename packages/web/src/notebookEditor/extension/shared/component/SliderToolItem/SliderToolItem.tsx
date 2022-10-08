import { isNodeSelection } from '@tiptap/core';
import { getSelectedNode, isNodeType, AttributeType, NodeName, SetNodeSelectionDocumentUpdate, SetTextSelectionDocumentUpdate, UpdateSingleNodeAttributesDocumentUpdate } from '@ureeka-notebook/web-service';

import { applyDocumentUpdates } from 'notebookEditor/command/update';
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
  const { $anchor, anchor } = selection;
  const node = getSelectedNode(state, depth);
  if(!node || !isNodeType(node, nodeName)) return null /*nothing to render - invalid node render*/;

  // == Handler ===================================================================
  const handleChange = (value: number, focus?: boolean) => {
    const nodeSelection = isNodeSelection(selection);
    const updatePos = isNodeSelection(selection)
      ? anchor
      : anchor - $anchor.parentOffset - 1/*select the Node itself*/;

    applyDocumentUpdates(editor, [
      new UpdateSingleNodeAttributesDocumentUpdate(nodeName as NodeName/*by definition*/, updatePos, { [attributeType]: value }),
      ...(nodeSelection ? [new SetNodeSelectionDocumentUpdate(anchor)] : [new SetTextSelectionDocumentUpdate({ from: anchor, to: anchor })]),
    ]);

    // focus the Editor again
    if(focus) editor.view.focus();
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
