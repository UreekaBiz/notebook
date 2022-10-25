import { Box } from '@chakra-ui/react';

import { isHorizontalRuleNode, isNodeSelection, updateSingleNodeAttributesCommand, AttributeType, NodeName, DEFAULT_HORIZONTAL_RULE_BACKGROUND_COLOR } from '@ureeka-notebook/web-service';

import { ColorPickerTool } from 'notebookEditor/extension/shared/component/ColorPickerToolItem/ColorPickerTool';
import { EditorToolComponentProps } from 'notebookEditor/sidebar/toolbar/type';
import { textColors } from 'notebookEditor/theme/type';

// ********************************************************************************
// == Component ===================================================================
interface Props extends EditorToolComponentProps {/*no additional*/}
export const HorizontalRuleColorToolItem: React.FC<Props> = ({ editor }) => {
  const { selection } = editor.state;
  const { anchor } = selection;
  if(!isNodeSelection(selection) || !isHorizontalRuleNode(selection.node)) throw new Error(`Invalid HorizontalRuleColorToolItem render: ${JSON.stringify(selection)}`);

  // == Handler ===================================================================
  const handleBorderColorChange = (value: string) => {
    updateSingleNodeAttributesCommand(NodeName.HORIZONTAL_RULE, anchor, { [AttributeType.BackgroundColor]: value })(editor.state, editor.view.dispatch);
    editor.view.focus();
  };

  // == UI ========================================================================
  const backgroundColorValue = selection.node.attrs[AttributeType.BackgroundColor];
  return (
    <Box>
      <ColorPickerTool
        name='Color'
        value={backgroundColorValue ?? DEFAULT_HORIZONTAL_RULE_BACKGROUND_COLOR}
        onChange={handleBorderColorChange}
        colors={textColors}
      />
    </Box>
  );
};
