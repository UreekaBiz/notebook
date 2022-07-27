import { Box, Divider, Flex, Text, VStack } from '@chakra-ui/react';
import { Node as ProsemirrorNode } from 'prosemirror-model';

import { getNodeName } from '@ureeka-notebook/web-service';

import { useValidatedEditor } from 'notebookEditor/hook/useValidatedEditor';
import { SelectionDepth } from 'notebookEditor/model/type';
import { getToolbar } from 'notebookEditor/toolbar/toolbar';

import { ToolItemComponent } from './ToolItem';

// ********************************************************************************
interface Props {
  node: ProsemirrorNode;
  depth: SelectionDepth;

  onSelection: (depth: SelectionDepth) => void;
  selectedDepth: SelectionDepth;
}
export const Toolbar: React.FC<Props> = ({ depth, node, onSelection, selectedDepth }) => {
  const nodeName = getNodeName(node);
  const toolbar = getToolbar(nodeName);
  const editor = useValidatedEditor();

  if(!toolbar) return null/*nothing to render*/;

  return (
    <Box>
      <Flex
        align='center'
        justify='space-between'
        width='full'
        paddingX={4}
        paddingY={2}
        backgroundColor={depth === selectedDepth ? '#ddd' : '#f3f3f3'}
        boxShadow='base'
        onClick={() => onSelection(depth)}
      >
        <Text
          marginBottom='1px'
          paddingY={0.1}
          fontSize={15}
          fontWeight='bold'
          textTransform='capitalize'
          _hover={{ cursor: 'pointer' }}
        >
          {toolbar.nodeName}
        </Text>
        {toolbar.rightContent && toolbar.rightContent({ editor, depth })}
      </Flex>
      <VStack divider={<Divider/>} spacing={0} display='flex' alignItems='flex-start' width='full'>
        {toolbar.toolsCollections.map((tools, i) =>
          <Box key={`${node.type.name}-${i}`} paddingX={4} paddingY={1} width='100%'>
            {tools.map(tool =>
              <ToolItemComponent key={`${node.type.name}-${tool.name}-${i}`} depth={depth} editor={editor} tool={tool} />)}
          </Box>
          )}
      </VStack>
    </Box>
  );
};
