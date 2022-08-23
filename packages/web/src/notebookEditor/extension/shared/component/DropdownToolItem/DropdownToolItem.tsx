import { Box, Flex, Text } from '@chakra-ui/react';

import { getSelectedNode, isNodeType, AttributeType, NodeName } from '@ureeka-notebook/web-service';

import { EditorToolComponentProps } from 'notebookEditor/toolbar/type';

import { DropdownTool, DropdownToolItemType } from './DropdownTool';

// ********************************************************************************
// == Component ===================================================================
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
  const node = getSelectedNode(state, depth);
  if(!node || !isNodeType(node, nodeName)) return null/*nothing to render - invalid node render*/;

  // == Handler ===================================================================
  const handleChange = (value: string) => {
    editor.chain()
          .updateAttributes(nodeName, { [attributeType]: value })
          .setNodeSelection(state.selection.$anchor.pos)/*set the selection in the same position in case that the node was replaced*/
          .run();

    // Focus the editor again
    editor.commands.focus();
  };

  // == UI ========================================================================
  const value = node.attrs[attributeType] ?? '' /*default*/;
  return (
    <Flex width='full' alignItems='center' gap={2}>
      <Box width={250} textAlign='right'>
        <Text fontSize='14px'>{name}</Text>
      </Box>
      <DropdownTool name={name} onChange={handleChange} options={options} value={value}/>
      <Box width={100}/>
    </Flex>
  );
};
