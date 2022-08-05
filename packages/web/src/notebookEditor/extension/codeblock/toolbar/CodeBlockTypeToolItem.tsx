import { isCodeBlockNode, AttributeType, CodeBlockType, NodeName } from '@ureeka-notebook/web-service';

import { DropdownTool } from 'notebookEditor/extension/shared/component/DropdownTool';
import { EditorToolComponentProps } from 'notebookEditor/toolbar/type';

// ********************************************************************************
interface Props extends EditorToolComponentProps {/*no additional*/}
export const CodeBlockTypeToolItem: React.FC<Props> = ({ editor }) => {
  const parentNode = editor.state.selection.$anchor.parent;
  if(!isCodeBlockNode(parentNode)) throw new Error('Invalid CodeBlock WrapTool Render');

  const type = parentNode.attrs[AttributeType.Type] ?? CodeBlockType.Code/*default*/;

  // -- Handler -------------------------------------------------------------------
  const handleChange = (selectedOption: string | React.FormEvent<HTMLDivElement>) => {
    // (SEE: CodeBlock.ts)
    editor.chain()
          .focus()
          .updateAttributes(NodeName.CODEBLOCK, {
            type: selectedOption,
            wrap: selectedOption === 'Code'
              ? false/*default wrap for Code type is false*/
              : true/*default wrap for Text type is true*/ })
          .setTextSelection(editor.state.selection.$anchor.pos)
          .run();
  };

  // -- UI ------------------------------------------------------------------------
  return (
    <DropdownTool
      name='Type'
      width='100%'
      marginTop='0'
      value={type}
      options={[CodeBlockType.Code, CodeBlockType.Text]}
      onChange={(selectedOption) => handleChange(selectedOption)}
    />
  );
};
