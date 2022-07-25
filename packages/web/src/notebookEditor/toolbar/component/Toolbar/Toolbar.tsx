import { Box, Divider, Flex, Text, VStack } from '@chakra-ui/react';
import { Node as ProsemirrorNode } from 'prosemirror-model';

import { NodeName } from '@ureeka-notebook/web-service';

import { useEditorService } from 'notebookEditor/hook/useEditorService';
import { SelectionDepth } from 'notebookEditor/model/type';
import { getToolbar } from 'notebookEditor/toolbar/toolbar';

import { ToolItem } from './ToolItem';

// ********************************************************************************
interface Props {
  node: ProsemirrorNode;
  depth: SelectionDepth;

  onSelection: (depth: SelectionDepth) => void;
  selectedDepth: SelectionDepth;
}
export const Toolbar: React.FC<Props> = ({ depth, node, onSelection, selectedDepth }) => {
  const toolbar = getToolbar(node.type.name as NodeName/*by definition*/);
  if(!toolbar) return null/*nothing to render*/;

  // == UI ========================================================================
  const { editor } = useEditorService();
  return (
    <Box>
      <Flex paddingX={4} align='center' justify='space-between' width='full' paddingY={2} backgroundColor={depth === selectedDepth ? '#ddd' : '#f3f3f3'} boxShadow='base' onClick={() => onSelection(depth)}>
        <Text marginBottom='1px' paddingY={0.1} fontSize={15} fontWeight='bold' textTransform='capitalize' _hover={{ cursor: 'pointer' }}>{toolbar.nodeName}</Text>
        {toolbar.rightContent && toolbar.rightContent(editor)}
      </Flex>
      <VStack divider={<Divider/>} spacing={0} display='flex' alignItems='flex-start' width='full'>
        {toolbar.toolsCollections.map((tools, i) =>
          <Box key={`${node.type.name}-${i}`} width='100%' paddingX={4} paddingY={1}>
            {tools.map(tool =>
              <ToolItem key={`${node.type.name}-${tool.name}-${i}`} depth={depth} editor={editor} tool={tool} />
            )}
          </Box>
          )}
      </VStack>
    </Box>
  );
};
