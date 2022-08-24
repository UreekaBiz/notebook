import { getSelectedNode, isNodeType, AttributeType, NodeName, isNodeSelection } from '@ureeka-notebook/web-service';

import { EditorToolComponentProps } from 'notebookEditor/toolbar/type';

import { InputToolItemContainer } from '../InputToolItemContainer';
import { InputTool } from './InputTool';

// ********************************************************************************
interface Props extends EditorToolComponentProps {
  /** the NodeName of the Node */
  nodeName: NodeName;
  /** the attribute that this ToolItems corresponds to */
  attributeType: AttributeType;

  /** the name of the ToolItem */
  name: string;
}
export const InputToolItem: React.FC<Props> = ({ editor, depth, nodeName, attributeType, name }) => {
  const { state } = editor;
  const { selection } = state;
  const node = getSelectedNode(state, depth);
  if(!node || !isNodeType(node, nodeName)) return null/*nothing to render - invalid node render*/;

  const value = node.attrs[attributeType] ?? '' /*default*/;

  // == Handler ===================================================================
  const handleChange = (value: string) => {
    editor.commands.updateAttributes(nodeName, { [attributeType]: value });

    const position = state.selection.anchor;
    // set the selection in the same position in case that the node was replaced
    if(isNodeSelection(selection)) editor.commands.setNodeSelection(position);
    else editor.commands.setTextSelection(position);

    // Focus the editor again
    editor.commands.focus();
  };

  // == UI ========================================================================
  return (
    <InputToolItemContainer name={name}>
      <InputTool value={value} placeholder={name} onChange={handleChange}/>
    </InputToolItemContainer>
  );
};
