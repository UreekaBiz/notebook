import { getSelectedNode, isNodeType, isNodeSelection, AttributeType, InvalidMergedAttributeValue, MarkName, NodeName } from '@ureeka-notebook/web-service';

import { getTextDOMRenderedValue  } from 'notebookEditor/extension/util/attribute';
import { EditorToolComponentProps } from 'notebookEditor/sidebar/toolbar/type';

import { ColorPickerTool } from './ColorPickerTool';

// ********************************************************************************
// == Node ========================================================================
interface ColorPickerNodeToolItemProps extends EditorToolComponentProps {
  nodeName: NodeName;

  /** the attribute that this ToolItems corresponds to */
  attributeType: AttributeType;

  /** the name of the ToolItem */
  name: string;
}
export const ColorPickerNodeToolItem: React.FC<ColorPickerNodeToolItemProps> = ({ editor, attributeType, depth, name, nodeName }) => {
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
  // NOTE: Not using InputToolItemContainer at this level since ColorPickerTool
  //       requires to have access to the UnitPicker which will be the right side
  //       content of the InputToolItemContainer.
  return <ColorPickerTool name={name} value={value} onChange={handleChange}/>;
};

// == Mark ========================================================================
interface ColorPickerMarkToolItemProps extends EditorToolComponentProps {
  markName: MarkName;

  /** the attribute that this ToolItems corresponds to */
  attributeType: AttributeType;

  /** the name of the ToolItem */
  name: string;
}
export const ColorPickerMarkToolItem: React.FC<ColorPickerMarkToolItemProps> = ({ editor, attributeType, markName, name }) => {
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
  // NOTE: Not using InputToolItemContainer at this level since ColorPickerTool
  //       requires to have access to the ColorPickerMenu which will be the right
  //       side content of the InputToolItemContainer.
  return <ColorPickerTool name={name} value={inputValue} onChange={handleChange}/>;
};

