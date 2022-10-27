import { InputProps } from '@chakra-ui/react';
import { getSelectedNode, isBlank, isNodeSelection, isNodeType, AttributeType, NodeName, SetNodeSelectionDocumentUpdate, SetTextSelectionDocumentUpdate, UpdateSingleNodeAttributesDocumentUpdate } from '@ureeka-notebook/web-service';

import { applyDocumentUpdates } from 'notebookEditor/command/update';
import { EditorToolComponentProps } from 'notebookEditor/sidebar/toolbar/type';

import { InputToolItemContainer } from '../InputToolItemContainer';
import { InputTool } from './InputTool';

// ********************************************************************************
interface Props extends EditorToolComponentProps, Omit<InputProps, 'onChange'> {
  /** the NodeName of the Node */
  nodeName: NodeName;
  /** the attribute that this ToolItems corresponds to */
  attributeType: AttributeType;

  /** the name of the ToolItem */
  name: string;
}
export const InputToolItem: React.FC<Props> = ({ editor, depth, nodeName, attributeType, name, type, ...props }) => {
  const { state } = editor;
  const { selection } = state;
  const { $anchor, anchor } = selection;
  const node = getSelectedNode(state, depth);
  if(!node || !isNodeType(node, nodeName)) return null/*nothing to render - invalid node render*/;

  const value = node.attrs[attributeType] ?? '' /*default*/;

  // == Handler ===================================================================
  const handleChange = (value: string) => {
    let parsedValue: string | undefined | number;

    if(isBlank(value)) parsedValue = undefined/*no value*/;
    else if(type === 'number') parsedValue = parseFloat(value);
    else parsedValue = value;

    const nodeSelection = isNodeSelection(selection);
    const updatePos = nodeSelection
      ? anchor
      : anchor - $anchor.parentOffset - 1/*select the Node itself*/;

    applyDocumentUpdates(editor, [
      new UpdateSingleNodeAttributesDocumentUpdate(nodeName as NodeName/*by definition*/, updatePos, { [attributeType]: parsedValue }),
      ...(nodeSelection ? [new SetNodeSelectionDocumentUpdate(anchor)] : [new SetTextSelectionDocumentUpdate({ from: anchor, to: anchor })]),
    ]);

    // focus the Editor again
    editor.view.focus();
  };

  // == UI ========================================================================
  return (
    <InputToolItemContainer name={name}>
      <InputTool value={value} placeholder={name} onChange={handleChange} type={type} {...props}/>
    </InputToolItemContainer>
  );
};
