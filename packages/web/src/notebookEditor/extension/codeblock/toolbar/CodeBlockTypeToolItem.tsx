import { isCodeBlockNode, AttributeType, CodeBlockType, NodeName, UpdateSingleNodeAttributesDocumentUpdate, SetTextSelectionDocumentUpdate } from '@ureeka-notebook/web-service';

import { applyDocumentUpdates } from 'notebookEditor/command/update';
import { DropdownTool, DropdownToolItemType } from 'notebookEditor/extension/shared/component/DropdownToolItem/DropdownTool';
import { InputToolItemContainer } from 'notebookEditor/extension/shared/component/InputToolItemContainer';
import { EditorToolComponentProps } from 'notebookEditor/sidebar/toolbar/type';

// ********************************************************************************
// NOTE: Using directly DropdownTool instead of DropdownToolItem because this needs
//       does extra functionality besides updating the AttributeType passed as a
//       prop.
const options: DropdownToolItemType[] = [{ value: CodeBlockType.Code, label: 'Code' }, { value: CodeBlockType.Text, label: 'Text' }];

interface Props extends EditorToolComponentProps {/*no additional*/}
export const CodeBlockTypeToolItem: React.FC<Props> = ({ editor }) => {
  const { $anchor, anchor } = editor.state.selection;
  const parentNode = $anchor.parent;
  if(!isCodeBlockNode(parentNode)) throw new Error('Invalid CodeBlock WrapTool Render');

  const type = parentNode.attrs[AttributeType.Type] ?? CodeBlockType.Code/*default*/;

  // == Handler ===================================================================
  const handleChange = (type: string) => {
    // text should wrap by contract (even though it can be change by the user)
    const wrap = type === CodeBlockType.Text;
    // (SEE: CodeBlock.ts)
    applyDocumentUpdates(editor, [
      new UpdateSingleNodeAttributesDocumentUpdate(NodeName.CODEBLOCK, anchor - $anchor.parentOffset - 1/*the CodeBlock itself*/, { [AttributeType.Type]: type, [AttributeType.Wrap]: wrap }),
      new SetTextSelectionDocumentUpdate({ from: anchor, to: anchor }),
    ]);
  };

  // == UI ========================================================================
  return (
    <InputToolItemContainer name='Type'>
      <DropdownTool value={type} options={options} placeholder='Type' onChange={handleChange}/>
    </InputToolItemContainer>
  );
};
