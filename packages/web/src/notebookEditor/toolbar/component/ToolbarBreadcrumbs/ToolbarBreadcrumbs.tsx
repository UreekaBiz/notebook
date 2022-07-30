import { Flex } from '@chakra-ui/react';

import { getNodeName, isTextNode } from '@ureeka-notebook/web-service';

import { getAllAscendantsFromSelection } from 'notebookEditor/extension/util/node';
import { useValidatedEditor } from 'notebookEditor/hook/useValidatedEditor';
import { SelectionDepth } from 'notebookEditor/model/type';
import { getToolbar } from 'notebookEditor/toolbar/toolbar';

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
    const nodeName = getNodeName(node);
    const depth = i === 0 ? undefined/*leaf node*/ : ascendantsNodes.length - i - 1;
    const toolbar = getToolbar(nodeName);

    if(!toolbar) return null/*no corresponding toolbar for this node*/;

    return (
      <ToolbarBreadcrumbItem
        key={`${node.type.name}-${i}`}/*expected to be unique*/
        depth={depth}
        isSelected={selectedDepth === depth}
        toolbar={toolbar}
        onSelection={onSelection}
      />
    );
  });

  return <Flex width='100%' overflowX='auto' padding={2}>{BreadCrumbItems}</Flex>;
};
