import { Box, Divider, VStack } from '@chakra-ui/react';

import { MarkName, NodeName, SelectionDepth } from '@ureeka-notebook/web-service';

import { useValidatedEditor } from 'notebookEditor/hook/useValidatedEditor';
import { SidebarSectionTitle } from 'notebookEditor/sidebar/component/SidebarSectionTitle';
import { Toolbar as ToolbarType } from 'notebookEditor/sidebar/toolbar/type';

import { shouldShowToolbarOrBreadcrumb } from '../../toolbar';
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

  // NOTE: A react component is meant to be rendered using JSX instead of calling
  //       toolbar.rightContent() directly since this mess ups the order of the
  //       hooks causing the problem "React has detected a change in the order of
  //       Hooks". To avoid this a valid component is created from the same function.
  const RightContent = toolbar.rightContent;

  // NOTE: The check must be done by the caller, this is just a safety check in in
  //       case that the caller does not check it.
  if(toolbar.shouldShow && !toolbar.shouldShow(editor, depth)) return null/*nothing to render*/;

  if(!shouldShowToolbarOrBreadcrumb(editor, toolbar, depth)) return null/*nothing to render*/;

  return (
    <>
      <SidebarSectionTitle
        rightContent={RightContent && <RightContent depth={depth} editor={editor} />}
        backgroundColor={depth === selectedDepth ? '#ddd' : '#f3f3f3'}
        onClick={() => onSelection(depth)}
      >
        {toolbar.title}
      </SidebarSectionTitle>
      <VStack divider={<Divider />} spacing={0} display='flex' alignItems='flex-start' width='full'>
        {toolbar.toolsCollections.map((tools, i) =>
          <Box key={`${nodeOrMarkName}-${i}`} paddingX={4} paddingY={1} width='100%'>
            {tools.map(tool =>
              <ToolItemComponent key={`${nodeOrMarkName}-${tool.name}-${i}`} depth={depth} editor={editor} tool={tool} />)}
          </Box>
        )}
      </VStack>
    </>
  );
};
