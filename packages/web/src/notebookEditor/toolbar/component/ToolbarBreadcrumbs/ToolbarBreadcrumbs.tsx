import { Flex } from '@chakra-ui/react';

import { getMarkName, getNodeName, isTextNode } from '@ureeka-notebook/web-service';

import { getAllMarksFromSelection } from 'notebookEditor/extension/util/mark';
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

  const breadCrumbItems: JSX.Element[] = [];

  const marks = getAllMarksFromSelection(editor.state);
  marks.forEach((mark, i) => {
    if(!mark) return /*nothing to do*/;
    const markName = getMarkName(mark);
    const depth = undefined;/*leaf node by definition*/
    const toolbar = getToolbar(markName);

    if(!toolbar) return/*no corresponding toolbar for this mark*/;

    breadCrumbItems.push(
      <ToolbarBreadcrumbItem
        key={`${markName}-${i}`}/*expected to be unique*/
        depth={depth}
        isSelected={selectedDepth === depth}
        toolbar={toolbar}
        onSelection={onSelection}
      />
    );
    return/*nothing else to do*/;
  });

  const ascendantsNodes = getAllAscendantsFromSelection(editor.state);
  ascendantsNodes.forEach((node, i) => {
    if(!node || isTextNode(node)/*don't display text nodes*/) return/*nothing to do*/;
    const nodeName = getNodeName(node);
    const depth = i === 0 ? undefined/*leaf node*/ : ascendantsNodes.length - i - 1;
    const toolbar = getToolbar(nodeName);

    if(!toolbar) return/*no corresponding toolbar for this node*/;

    breadCrumbItems.push(
      <ToolbarBreadcrumbItem
        key={`${nodeName}-${i}`}/*expected to be unique*/
        depth={depth}
        isSelected={selectedDepth === depth}
        toolbar={toolbar}
        onSelection={onSelection}
      />
    );
    return/*nothing else to do*/;
  });

  return <Flex width='100%' overflowX='auto' padding={2}>{breadCrumbItems}</Flex>;
};
