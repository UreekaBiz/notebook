import { isCodeBlockNode, AttributeType, NodeName } from '@ureeka-notebook/web-service';

import { CheckboxTool } from 'notebookEditor/extension/shared/component/CheckBoxTool';
import { EditorToolComponentProps } from 'notebookEditor/toolbar/type';

// ********************************************************************************
interface Props extends EditorToolComponentProps {/*no additional*/}
export const CodeBlockWrapToolItem: React.FC<Props> = ({ editor }) => {
  const parentNode = editor.state.selection.$anchor.parent;
  if(!isCodeBlockNode(parentNode)) throw new Error('Invalid CodeBlock WrapTool Render');

  const wrap  = parentNode.attrs[AttributeType.Wrap] ?? false/*default*/;

  // -- UI ------------------------------------------------------------------------
  return (
    <CheckboxTool
      name=''/*do not display anything as the name*/
      width='100%'
      marginTop='0'
      value={wrap}
      onChange={() => editor.chain().focus().updateAttributes(NodeName.CODEBLOCK, { wrap: !wrap }).setTextSelection(editor.state.selection.$anchor.pos).run()}
      checkName='Line Wrap'
    />
  );
};
