import { Checkbox } from '@chakra-ui/react';
import { isNodeSelection } from '@tiptap/core';
import { ChangeEvent } from 'react';

import { AttributeType, getSelectedNode, isNodeType, NodeName } from '@ureeka-notebook/service-common';

import { EditorToolComponentProps, TOOL_ITEM_DATA_TYPE } from 'notebookEditor/toolbar/type';

import { InputToolItemContainer } from './InputToolItemContainer';

// ********************************************************************************
interface Props extends EditorToolComponentProps {
  /** the NodeName of the Node */
  nodeName: NodeName;
  /** the attribute that this ToolItems corresponds to */
  attributeType: AttributeType;

  /** the name of the ToolItem */
  name: string;
}
export const CheckBoxToolItem: React.FC<Props> = ({ attributeType, depth, editor, name, nodeName }) => {
  const { state } = editor;
  const { selection } = state;
  const node = getSelectedNode(state, depth);
  if(!node || !isNodeType(node, nodeName)) return null/*nothing to render - invalid node render*/;

  const value = node.attrs[attributeType] ?? false /*default*/;

  // == Handler ===================================================================
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.checked;

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
      <Checkbox
        isChecked={value}
        datatype={TOOL_ITEM_DATA_TYPE/*(SEE: notebookEditor/toolbar/type )*/}
        onChange={handleChange}
      >
        {name}
      </Checkbox>
    </InputToolItemContainer>
  );
};
