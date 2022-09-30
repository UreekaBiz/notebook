import { Box } from '@chakra-ui/react';

import { isBlank, isImageNode, isNodeSelection, AttributeType, BorderStyle, NodeName, SetNodeSelectionDocumentUpdate, UpdateAttributesDocumentUpdate, DEFAULT_IMAGE_BORDER_COLOR, DEFAULT_IMAGE_BORDER_STYLE, DEFAULT_IMAGE_BORDER_WIDTH } from '@ureeka-notebook/web-service';

import { applyDocumentUpdates } from 'notebookEditor/command/update';
import { EditorToolComponentProps } from 'notebookEditor/sidebar/toolbar/type';
import { textColors } from 'notebookEditor/theme/type';
import { ColorPickerTool } from 'notebookEditor/extension/shared/component/ColorPickerToolItem/ColorPickerTool';
import { InputWithUnitNodeToolItem } from 'notebookEditor/extension/shared/component/InputWithUnitToolItem';
import { DropdownToolItem } from 'notebookEditor/extension/shared/component/DropdownToolItem';

// ********************************************************************************
// == Constant ====================================================================
const imageBorderStyleOptions = Object.values(BorderStyle).map((value) => ({ value, label: value }));

// == Component ===================================================================
interface Props extends EditorToolComponentProps {/*no additional*/ }
export const ImageBorderToolItem: React.FC<Props> = ({ editor, depth }) => {
  const { selection } = editor.state,
    { pos: prevPos } = selection.$anchor;
  if(!isNodeSelection(selection) || !isImageNode(selection.node)) throw new Error(`Invalid ImageBorderToolItem render: ${JSON.stringify(selection)}`);

  // == Handler ===================================================================
  // update the Attributes and select the previous position
  const handleBorderColorChange = (value: string) => applyDocumentUpdates(editor, [
    new UpdateAttributesDocumentUpdate(NodeName.IMAGE, { [AttributeType.BorderColor]: value }),
    new SetNodeSelectionDocumentUpdate(prevPos),
  ]);

  // == UI ========================================================================
  let { borderColor: colorValue, borderWeight: borderWeightValue, borderStyle: borderDashValue } = selection.node.attrs;
  isBlank(colorValue) || colorValue === undefined ? colorValue = DEFAULT_IMAGE_BORDER_COLOR : colorValue/*don't change*/;
  isBlank(borderWeightValue) || borderWeightValue === undefined ? borderWeightValue = DEFAULT_IMAGE_BORDER_WIDTH : borderWeightValue/*don't change*/;
  isBlank(borderDashValue) || borderDashValue === undefined ? borderDashValue = DEFAULT_IMAGE_BORDER_STYLE : borderDashValue/*don't change*/;
  return (
    <Box>
      <ColorPickerTool
        name='Border Color'
        value={colorValue}
        onChange={handleBorderColorChange}
        colors={textColors}
      />
      <InputWithUnitNodeToolItem
        name='Border Weight'
        nodeName={NodeName.IMAGE}
        attributeType={AttributeType.BorderWidth}
        editor={editor}
        depth={depth}
      />
      <DropdownToolItem
        nodeName={NodeName.IMAGE}
        attributeType={AttributeType.BorderStyle}
        name={'Border Dash'}
        options={imageBorderStyleOptions}
        editor={editor}
        depth={depth}
      />
    </Box>
  );
};
