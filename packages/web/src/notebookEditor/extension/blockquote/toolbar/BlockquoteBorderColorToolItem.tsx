import { Box } from '@chakra-ui/react';

import { isBlockquoteNode, updateSingleNodeAttributesCommand, AttributeType, NodeName, DEFAULT_BLOCKQUOTE_BORDER_LEFT_COLOR } from '@ureeka-notebook/web-service';

import { ColorPickerTool } from 'notebookEditor/extension/shared/component/ColorPickerToolItem/ColorPickerTool';
import { EditorToolComponentProps } from 'notebookEditor/sidebar/toolbar/type';
import { textColors } from 'notebookEditor/theme/type';

// ********************************************************************************
// == Component ===================================================================
interface Props extends EditorToolComponentProps {/*no additional*/}
export const BlockquoteBorderColorToolItem: React.FC<Props> = ({ editor }) => {
  const { selection } = editor.state;
  const { $anchor } = selection;
  if(!isBlockquoteNode($anchor.parent)) throw new Error(`Invalid BlockquoteBorderColorToolItem render: ${JSON.stringify(selection)}`);

  // == Handler ===================================================================
  const handleBorderColorChange = (value: string) => {
    updateSingleNodeAttributesCommand(NodeName.BLOCKQUOTE, $anchor.pos - $anchor.parentOffset - 1/*the Blockquote itself*/, { [AttributeType.BorderColor]: value })(editor.state, editor.view.dispatch);
    editor.view.focus();
  };

  // == UI ========================================================================
  const borderColorValue = $anchor.parent.attrs[AttributeType.BorderColor];
  return (
    <Box>
      <ColorPickerTool
        name='Border Color'
        value={borderColorValue ?? DEFAULT_BLOCKQUOTE_BORDER_LEFT_COLOR}
        onChange={handleBorderColorChange}
        colors={textColors}
      />
    </Box>
  );
};
