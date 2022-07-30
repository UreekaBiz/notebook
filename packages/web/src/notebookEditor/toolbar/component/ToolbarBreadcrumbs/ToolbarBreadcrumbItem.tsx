import { Flex, Text } from '@chakra-ui/react';

import { SelectionDepth } from 'notebookEditor/model/type';
import { Toolbar } from 'notebookEditor/toolbar/type';
import { useValidatedEditor } from 'notebookEditor/hook/useValidatedEditor';

// ********************************************************************************
interface Props {
  depth: SelectionDepth;
  isSelected: boolean;
  toolbar: Toolbar;

  onSelection: (depth: SelectionDepth) => void;
}
export const ToolbarBreadcrumbItem: React.FC<Props> = ({ depth, toolbar, isSelected, onSelection }) => {
  const editor = useValidatedEditor();
  if(toolbar.shouldShow && !toolbar.shouldShow(editor, depth)) return null/*don't show this breadcrumb*/;

  const handleClick = () => onSelection(depth);

  return (
    <Flex onClick={handleClick}>
      <Text textTransform='capitalize' fontWeight={isSelected ? 600 : 400}>{toolbar.title}</Text>
      {depth !== 0 && <Text marginX={1}>{'>'}</Text>}
    </Flex>
  );
};
