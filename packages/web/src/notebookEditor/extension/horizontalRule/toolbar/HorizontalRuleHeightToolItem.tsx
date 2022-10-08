import { Box } from '@chakra-ui/react';

import { isHorizontalRuleNode, isNodeSelection, AttributeType, NodeName } from '@ureeka-notebook/service-common';
import { InputWithUnitNodeToolItem } from 'notebookEditor/extension/shared/component/InputWithUnitToolItem';
import { EditorToolComponentProps } from 'notebookEditor/sidebar/toolbar/type';

// ********************************************************************************
// == Component ===================================================================
interface Props extends EditorToolComponentProps {/*no additional*/}
export const HorizontalRuleHeightToolItem: React.FC<Props> = ({ editor, depth }) => {
  const { selection } = editor.state;
  if(!isNodeSelection(selection) || !isHorizontalRuleNode(selection.node)) throw new Error(`Invalid HorizontalRuleHeightToolItem render: ${JSON.stringify(selection)}`);

  // == UI ========================================================================
  return (
    <Box>
      <InputWithUnitNodeToolItem
        name='Height'
        nodeName={NodeName.HORIZONTAL_RULE}
        attributeType={AttributeType.Height}
        editor={editor}
        depth={depth}
      />
    </Box>
  );
};
