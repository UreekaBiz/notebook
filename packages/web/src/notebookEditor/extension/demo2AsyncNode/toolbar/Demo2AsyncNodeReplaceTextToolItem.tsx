import { AttributeType, isDemo2AsyncNode, NodeName } from '@ureeka-notebook/web-service';

import { InputTool } from 'notebookEditor/extension/shared/component/InputTool';
import { EditorToolComponentProps } from 'notebookEditor/toolbar/type';

// ********************************************************************************
interface Props extends EditorToolComponentProps {/*no additional*/}
export const Demo2AsyncNodeReplaceTextToolItem: React.FC<Props> = ({ editor }) => {
  const parentNode = editor.state.selection.$anchor.parent;
  if(!isDemo2AsyncNode(parentNode)) throw new Error('Invalid Demo2AsyncNode ReplaceTextToolItem Render');

  const { attrs } = parentNode;

  const handleChange = (value: string, focusEditor?: boolean) => {
    editor.chain()
          .updateAttributes(NodeName.DEMO_2_ASYNC_NODE, { [AttributeType.TextToReplace]: value.trim() })
          .run();

    // Focus the editor again
    if(focusEditor) editor.commands.focus();
  };

  // == UI ========================================================================
  const value = attrs[AttributeType.TextToReplace] ?? ''/*default*/;

  return (
    <InputTool
      name='Replace'
      initialInputValue={value}
      inputPlaceholder='Text to replace'
      onChange={handleChange}
    />
  );
};
