import { isImageNode, AttributeType, NodeName } from '@ureeka-notebook/web-service';

import { InputTool } from 'notebookEditor/extension/shared/component/InputTool';
import { isNodeSelection } from 'notebookEditor/extension/util/node';
import { EditorToolComponentProps } from 'notebookEditor/toolbar/type';

// ********************************************************************************
interface Props extends EditorToolComponentProps {/*no additional*/}
export const ImageTitleToolItem: React.FC<Props> = ({ editor }) => {
  const { selection } = editor.state,
        { pos: prevPos } = selection.$anchor;
  if(!isNodeSelection(selection) || !isImageNode(selection.node)) throw new Error(`Invalid ImageTitleToolItem render: ${JSON.stringify(selection)}`);

  // == Handler ===================================================================
  // update the Attributes and select the previous position
  const handleChange = (value: string, focusEditor?: boolean) => {
    editor.chain()
          .updateAttributes(NodeName.IMAGE, { title: value })
          .setNodeSelection(prevPos)
          .run();

    // focus the editor again
    if(focusEditor) editor.commands.focus();
  };

  // == UI ========================================================================
  const value = selection.node.attrs[AttributeType.Title] ?? ''/*default*/;
  return (
    <InputTool
      name='Title'
      initialInputValue={value}
      inputPlaceholder='Modify Title'
      onChange={handleChange}
    />
  );
};
