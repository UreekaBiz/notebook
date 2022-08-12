import { isImageNode, isNodeSelection, AttributeType, NodeName, MAX_IMAGE_WIDTH, MIN_IMAGE_WIDTH } from '@ureeka-notebook/web-service';

import { UnitPickerInput } from 'notebookEditor/extension/style/component/UnitPickerInput';
import { separateUnitFromString } from 'notebookEditor/theme/type';
import { EditorToolComponentProps } from 'notebookEditor/toolbar/type';

// ********************************************************************************
interface Props extends EditorToolComponentProps {/*no additional*/}
export const ImageWidthToolItem: React.FC<Props> = ({ editor }) => {
  const { selection } = editor.state,
    { pos: prevPos } = selection.$anchor;
  if(!isNodeSelection(selection) || !isImageNode(selection.node)) throw new Error(`Invalid ImageWidthToolItem render: ${JSON.stringify(selection)}`);

  // == Handler ===================================================================
  // update the Attributes and select the previous position
  const handleChange = (updatedValue: string, focusEditor?: boolean) => {
    const [value, unit] = separateUnitFromString(updatedValue);

    // force the value to be within the allowed range
    const width = Math.min(MAX_IMAGE_WIDTH, Math.max(MIN_IMAGE_WIDTH, parseFloat(value)));
    editor.chain()
          .updateAttributes(NodeName.IMAGE, { width: `${width}${unit}` })
          .setNodeSelection(prevPos)
          .run();

    // focus the editor again
    if(focusEditor) editor.commands.focus();
  };

  // == UI ========================================================================
  const value = selection.node.attrs[AttributeType.Width] ?? ''/*default*/;
  return (
    <UnitPickerInput
      name='Width'
      onChange={handleChange}
      valueWithUnit={value}
    />
  );
};
