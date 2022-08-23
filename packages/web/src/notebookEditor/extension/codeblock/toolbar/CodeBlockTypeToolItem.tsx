import { isCodeBlockNode, AttributeType, CodeBlockType, NodeName } from '@ureeka-notebook/web-service';

import { DropdownTool, DropdownToolItemType } from 'notebookEditor/extension/shared/component/DropdownToolItem/DropdownTool';
import { EditorToolComponentProps } from 'notebookEditor/toolbar/type';

// ********************************************************************************
// NOTE: Using directly DropdownTool instead of DropdownToolItem because this needs
//       does extra functionality besides updating the AttributeType passed as a
//       prop.
const options: DropdownToolItemType[] = [{ value: CodeBlockType.Code, label: 'Code' }, { value: CodeBlockType.Text, label: 'Text' }];

interface Props extends EditorToolComponentProps {/*no additional*/}
export const CodeBlockTypeToolItem: React.FC<Props> = ({ editor }) => {
  const parentNode = editor.state.selection.$anchor.parent;
  if(!isCodeBlockNode(parentNode)) throw new Error('Invalid CodeBlock WrapTool Render');

  const type = parentNode.attrs[AttributeType.Type] ?? CodeBlockType.Code/*default*/;

  // == Handler ===================================================================
  const handleChange = (type: string) => {
    // text should wrap by contract (even though it can be change by the user)
    const wrap = type === CodeBlockType.Text;
    // (SEE: CodeBlock.ts)
    editor.chain()
          .focus()
          .updateAttributes(NodeName.CODEBLOCK, { type, wrap })
          .setTextSelection(editor.state.selection.$anchor.pos)
          .run();
  };

  // == UI ========================================================================
  return <DropdownTool name='Type' value={type} options={options} onChange={handleChange}/>;
};
