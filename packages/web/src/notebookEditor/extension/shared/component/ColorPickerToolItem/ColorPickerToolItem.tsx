import { getSelectedNode, isNodeType, isNodeSelection, AttributeType, InvalidMergedAttributeValue, MarkName, NodeName, SetNodeSelectionDocumentUpdate, SetTextSelectionDocumentUpdate, UpdateSingleNodeAttributesDocumentUpdate } from '@ureeka-notebook/web-service';

import { applyDocumentUpdates } from 'notebookEditor/command/update';
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

