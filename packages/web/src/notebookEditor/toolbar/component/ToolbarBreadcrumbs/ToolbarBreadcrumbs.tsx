import { Flex } from '@chakra-ui/react';

import { isTextNode } from '@ureeka-notebook/web-service';

import { getAllAscendantsFromSelection } from 'notebookEditor/extension/util/node';
import { useValidatedEditor } from 'notebookEditor/hook/useValidatedEditor';
import { SelectionDepth } from 'notebookEditor/model/type';

import { ToolbarBreadcrumbItem } from './ToolbarBreadcrumbItem';

// ********************************************************************************
interface Props {
  onSelection: (depth: SelectionDepth) => void;
  selectedDepth: SelectionDepth;
}
export const ToolbarBreadcrumbs: React.FC<Props> = ({ onSelection, selectedDepth }) => {
  const editor = useValidatedEditor();
  const ascendantsNodes = getAllAscendantsFromSelection(editor.state);

  const BreadCrumbItems = ascendantsNodes.map((node, i) => {
    if(!node || isTextNode(node)/*don't display text nodes*/) return undefined;
    const depth = i === 0 ? undefined/*leaf node*/ : ascendantsNodes.length - i - 1;
    return (
      <ToolbarBreadcrumbItem
        key={`${node.type.name}-${i}`}/*expected to be unique*/
        depth={depth}
        isSelected={selectedDepth === depth}
        node={node}
        onSelection={onSelection}
      />
    );
  });

  return <Flex width='100%' overflowX='auto' padding={2}>{BreadCrumbItems}</Flex>;
};
