import { Box } from '@chakra-ui/react';

import { isBlockquoteNode, AttributeType, NodeName } from '@ureeka-notebook/web-service';

import { InputWithUnitNodeToolItem } from 'notebookEditor/extension/shared/component/InputWithUnitToolItem';
import { EditorToolComponentProps } from 'notebookEditor/sidebar/toolbar/type';

// ********************************************************************************
// == Component ===================================================================
interface Props extends EditorToolComponentProps {/*no additional*/}
export const BlockquoteBorderLeftWidthToolItem: React.FC<Props> = ({ editor, depth }) => {
  const { selection } = editor.state;
  const { $anchor } = selection;
  if(!isBlockquoteNode($anchor.parent)) throw new Error(`Invalid BlockquoteBorderLeftWidthToolItem render: ${JSON.stringify(selection)}`);

  // == UI ========================================================================
  return (
    <Box>
      <InputWithUnitNodeToolItem
        name='Width'
        nodeName={NodeName.BLOCKQUOTE}
        attributeType={AttributeType.BorderLeft}
        editor={editor}
        depth={depth}
      />
    </Box>
  );
};
