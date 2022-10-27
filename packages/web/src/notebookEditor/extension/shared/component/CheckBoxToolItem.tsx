import { Checkbox } from '@chakra-ui/react';
import { ChangeEvent } from 'react';

import { getSelectedNode, isNodeSelection, isNodeType, AttributeType, NodeName, SetNodeSelectionDocumentUpdate, SetTextSelectionDocumentUpdate, UpdateSingleNodeAttributesDocumentUpdate } from '@ureeka-notebook/web-service';

import { applyDocumentUpdates } from 'notebookEditor/command/update';
import { EditorToolComponentProps, TOOL_ITEM_DATA_TYPE } from 'notebookEditor/sidebar/toolbar/type';

import { InputToolItemContainer } from './InputToolItemContainer';

// ********************************************************************************
interface Props extends EditorToolComponentProps {
  /** the NodeName of the Node */
  nodeName: NodeName;
  /** the attribute that this ToolItems corresponds to */
  attributeType: AttributeType;

  /** the name of the ToolItem */
  name: string;
}
export const CheckBoxToolItem: React.FC<Props> = ({ attributeType, depth, editor, name, nodeName }) => {
  const { state } = editor;
  const { selection } = state;
  const { $anchor, anchor } = selection;
  const node = getSelectedNode(state, depth);
  if(!node || !isNodeType(node, nodeName)) return null/*nothing to render - invalid node render*/;

  const value = node.attrs[attributeType] ?? false /*default*/;

  // == Handler ===================================================================
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.checked;

    const nodeSelection = isNodeSelection(selection);
    const updatePos = nodeSelection
      ? anchor
      : anchor - $anchor.parentOffset - 1/*select the Node itself*/;

    applyDocumentUpdates(editor, [
      new UpdateSingleNodeAttributesDocumentUpdate(nodeName as NodeName/*by definition*/, updatePos, { [attributeType]: value }),
      ...(nodeSelection ? [new SetNodeSelectionDocumentUpdate(anchor)] : [new SetTextSelectionDocumentUpdate({ from: anchor, to: anchor })]),
    ]);

    // focus the Editor again
    editor.view.focus();
  };

  // == UI ========================================================================
  return (
    <InputToolItemContainer name={name}>
      <Checkbox
        isChecked={value}
        datatype={TOOL_ITEM_DATA_TYPE/*(SEE: notebookEditor/sidebar/toolbar/type )*/}
        onChange={handleChange}
      >
        {name}
      </Checkbox>
    </InputToolItemContainer>
  );
};
