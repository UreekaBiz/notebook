import { Flex, Text } from '@chakra-ui/react';
import { Node as ProseMirrorNode } from 'prosemirror-model';

import { SelectionDepth } from 'notebookEditor/model/type';

// ********************************************************************************
interface Props {
  depth: SelectionDepth;
  isSelected: boolean;
  node: ProseMirrorNode;

  onSelection: (depth: SelectionDepth) => void;
}
export const ToolbarBreadcrumbItem: React.FC<Props> = ({ depth, node, isSelected, onSelection }) =>
  <Flex onClick={() => onSelection(depth)}>
    <Text textTransform='capitalize' fontWeight={isSelected ? 600 : 400}>{node.type.name}</Text>
    {depth !== 0 && <Text marginX={1}>{'>'}</Text>}
  </Flex>;
