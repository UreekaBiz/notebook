import { Box, Divider, Flex, Text, VStack } from '@chakra-ui/react';

import { MarkName, NodeName } from '@ureeka-notebook/web-service';

import { useValidatedEditor } from 'notebookEditor/hook/useValidatedEditor';
import { SelectionDepth } from 'notebookEditor/model/type';
import { Toolbar as ToolbarType } from 'notebookEditor/toolbar/type';

import { ToolItemComponent } from './ToolItem';

// ********************************************************************************
interface Props {
  nodeOrMarkName: MarkName | NodeName;
  toolbar: ToolbarType/*renamed to avoid naming conflict*/;

  depth: SelectionDepth;
  selectedDepth: SelectionDepth;

  onSelection: (depth: SelectionDepth) => void;
}
export const Toolbar: React.FC<Props> = ({ depth, nodeOrMarkName, toolbar,  selectedDepth, onSelection }) => {
  const editor = useValidatedEditor();

  // NOTE: The check must be done by the caller, this is just a safety check in in
  //       case that the caller does not check it.
  if(toolbar.shouldShow && !toolbar.shouldShow(editor, depth)) return null/*nothing to render*/;

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
          {toolbar.title}
        </Text>
        {toolbar.rightContent && toolbar.rightContent({ editor, depth })}
      </Flex>
      <VStack divider={<Divider />} spacing={0} display='flex' alignItems='flex-start' width='full'>
        {toolbar.toolsCollections.map((tools, i) =>
          <Box key={`${nodeOrMarkName}-${i}`} paddingX={4} paddingY={1} width='100%'>
            {tools.map(tool =>
              <ToolItemComponent key={`${nodeOrMarkName}-${tool.name}-${i}`} depth={depth} editor={editor} tool={tool} />)}
          </Box>
          )}
      </VStack>
    </Box>
  );
};
