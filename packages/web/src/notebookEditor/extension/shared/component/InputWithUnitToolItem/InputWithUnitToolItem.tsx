import { getSelectedNode, isNodeSelection, isNodeType, AttributeType, InvalidMergedAttributeValue, MarkName, NodeName, SetNodeSelectionDocumentUpdate, SetTextSelectionDocumentUpdate, UpdateSingleNodeAttributesDocumentUpdate  } from '@ureeka-notebook/web-service';

import { applyDocumentUpdates } from 'notebookEditor/command/update';
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
  const { $anchor, anchor } = selection;
  const node = getSelectedNode(state, depth);
  if(!node || !isNodeType(node, nodeName)) return null/*nothing to render - invalid node render*/;

  const value = node.attrs[attributeType] ?? '' /*default*/;

  // -- Handler -------------------------------------------------------------------
  const handleChange = (value: string, focus?: boolean) => {
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
