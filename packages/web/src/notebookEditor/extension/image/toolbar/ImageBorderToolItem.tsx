import { Box } from '@chakra-ui/react';

import { isImageNode, isNodeSelection, AttributeType, BorderStyle, NodeName, SetNodeSelectionDocumentUpdate, UpdateAttributesDocumentUpdate, DEFAULT_IMAGE_BORDER_COLOR } from '@ureeka-notebook/web-service';

import { applyDocumentUpdates } from 'notebookEditor/command/update';
import { EditorToolComponentProps } from 'notebookEditor/sidebar/toolbar/type';
import { textColors } from 'notebookEditor/theme/type';
import { GoogleDocsColorPickerTool } from 'notebookEditor/extension/shared/component/GoogleDocsColorPickerToolItem/GoogleDocsColorPickerTool';
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
  const { node } = selection;
  let colorValue = node.attrs[AttributeType.BorderColor];

  return (
    <Box>
      <GoogleDocsColorPickerTool
        name='Border Color'
        value={colorValue ?? DEFAULT_IMAGE_BORDER_COLOR}
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
