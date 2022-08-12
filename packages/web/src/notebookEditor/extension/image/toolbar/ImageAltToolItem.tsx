import { isImageNode, isNodeSelection, AttributeType, NodeName } from '@ureeka-notebook/web-service';

import { InputTool } from 'notebookEditor/extension/shared/component/InputTool';
import { EditorToolComponentProps } from 'notebookEditor/toolbar/type';

// ********************************************************************************
interface Props extends EditorToolComponentProps {/*no additional*/}
export const ImageAltToolItem: React.FC<Props> = ({ editor }) => {
  const { selection } = editor.state,
        { pos: prevPos } = selection.$anchor;
  if(!isNodeSelection(selection) || !isImageNode(selection.node)) throw new Error(`Invalid ImageAltToolItem render: ${JSON.stringify(selection)}`);

  // == Handler ===================================================================
  // update the Attributes and select the previous position
  const handleChange = (value: string, focusEditor?: boolean) => {
    editor.chain()
          .updateAttributes(NodeName.IMAGE, { alt: value })
          .setNodeSelection(prevPos)
          .run();

    // focus the editor again
    if(focusEditor) editor.commands.focus();
  };

  // == Handler ===================================================================
  const value = selection.node.attrs[AttributeType.Alt] ?? ''/*default*/;
  return (
    <InputTool
      name='Alt'
      initialInputValue={value}
      inputPlaceholder='Modify Alt'
      onChange={handleChange}
    />
  );
};
