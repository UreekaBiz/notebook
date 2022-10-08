import { getSelectedNode, isNodeType, isNodeSelection, AttributeType, NodeName, SetNodeSelectionDocumentUpdate, SetTextSelectionDocumentUpdate, UpdateSingleNodeAttributesDocumentUpdate } from '@ureeka-notebook/web-service';

import { applyDocumentUpdates } from 'notebookEditor/command/update';
import { EditorToolComponentProps } from 'notebookEditor/sidebar/toolbar/type';

import { InputToolItemContainer } from '../InputToolItemContainer';
import { DropdownTool, DropdownToolItemType } from './DropdownTool';

// ********************************************************************************
interface Props extends EditorToolComponentProps {
  /** the NodeName of the Node */
  nodeName: NodeName;
  /** the attribute that this ToolItems corresponds to */
  attributeType: AttributeType;

  /** the name of the ToolItem */
  name: string;

  options: DropdownToolItemType[];
}
export const DropdownToolItem: React.FC<Props> = ({ editor, depth, nodeName, attributeType, name, options }) => {
  const { state } = editor;
  const { selection } = state;
  const { $anchor, anchor } = selection;
  const node = getSelectedNode(state, depth);
  if(!node || !isNodeType(node, nodeName)) return null/*nothing to render - invalid node render*/;

  // == Handler ===================================================================
  const handleChange = (value: string) => {
    const nodeSelection = isNodeSelection(selection);
    const updatePos = isNodeSelection(selection)
      ? anchor
      : anchor - $anchor.parentOffset - 1/*select the Node itself*/;

    applyDocumentUpdates(editor, [
      new UpdateSingleNodeAttributesDocumentUpdate(nodeName as NodeName/*by definition*/, updatePos, { [attributeType]: value }),
      ...(nodeSelection ? [new SetNodeSelectionDocumentUpdate(anchor)] : [new SetTextSelectionDocumentUpdate({ from: anchor, to: anchor })]),
    ]);

    // focus the Editor again
    editor.view.focus();
  };

  // == UI ========================================================================
  const value = node.attrs[attributeType] ?? '' /*default*/;
  return (
    <InputToolItemContainer name={name}>
      <DropdownTool value={value} options={options} placeholder={name} onChange={handleChange}/>
    </InputToolItemContainer>
  );
};
