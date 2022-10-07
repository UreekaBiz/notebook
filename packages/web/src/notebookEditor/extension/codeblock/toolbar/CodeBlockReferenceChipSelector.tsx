import { useCallback, useEffect } from 'react';

import { getLogger, getSelectedNode, isNodeType, isNodeSelection, AttributeType, Logger, NodeName, DATA_VISUAL_ID } from '@ureeka-notebook/web-service';

import { focusCodeBlock, getLabelFromValue, getValueFromLabel, isValidCodeBlockReference, validateChip } from 'notebookEditor/extension/codeblock/util';
import { ChipValue } from 'notebookEditor/extension/shared/component/chipTool/Chip';
import { ChipTool } from 'notebookEditor/extension/shared/component/chipTool/ChipTool';
import { InputToolItemContainer } from 'notebookEditor/extension/shared/component/InputToolItemContainer';
import { EditorToolComponentProps } from 'notebookEditor/sidebar/toolbar/type';

const log = getLogger(Logger.NOTEBOOK);

// ********************************************************************************
// NOTE: This component is meant to be used with nodes that requires only one
//       reference to be selected.
interface Props extends EditorToolComponentProps {
  nodeName: NodeName;
}
export const CodeBlockReferenceChipSelector: React.FC<Props> = ({ editor, depth, nodeName }) => {
  const { state } = editor;
  const { selection } = state;
  const node = getSelectedNode(state, depth);

  const updateAttribute = useCallback((value: string | undefined, focus?: boolean) => {
    editor.chain().focus().updateAttributes(nodeName, { [AttributeType.CodeBlockReference]: value }).run();

    const position = state.selection.anchor;
    // set the selection in the same position in case that the node was replaced
    if(isNodeSelection(selection)) editor.commands.setNodeSelection(position);
    else editor.commands.setTextSelection(position);

    // Focus the editor again
    if(focus) editor.commands.focus();
  }, [editor, nodeName, selection, state.selection.anchor]);

  // == Effect ====================================================================
  /** doing CMD + Click on a VisualId toggles it from the CodeBlockReference */
  useEffect(() => {
    if(!node) return/*nothing to do*/;
    const reference = node.attrs[AttributeType.CodeBlockReference];

    const handler = async (event: MouseEvent) => {
      if(!event.metaKey) return/*not a meta key is pressed -- nothing to do*/;

      const { target } = event;
      if(!target) return/*no target -- nothing to do*/;
      if(!(target instanceof HTMLElement)) return/*not an element -- nothing to do*/;
      const visualId = target.getAttribute(DATA_VISUAL_ID);
      if(!visualId) return/*no visualId -- nothing to do*/;
      const codeBlockReference = isValidCodeBlockReference(editor, visualId);
      if(!codeBlockReference.isValid) return/*not a valid codeBlockReference -- nothing to do*/;
      const codeblockId = codeBlockReference.codeBlockView.node.attrs[AttributeType.Id] ?? ''/*no id by default*/;
      event.preventDefault();
      event.stopPropagation();

      // toggles the value
      const newValue = codeblockId === reference ? '' : codeblockId;
      updateAttribute(newValue, false/*don't focus*/);
    };

    window.addEventListener('mousedown', handler);

    // removes the listener on unmount
    return () => { window.removeEventListener('mousedown', handler); };
  }, [editor, nodeName, node, updateAttribute]);

  if(!node || !isNodeType(node, nodeName)) return null/*nothing to render - invalid node render*/;

  // gets the value in an array to be used by ChipTool
  const reference = node.attrs[AttributeType.CodeBlockReference],
        value = reference ? [reference] : [],
        id = node.attrs[AttributeType.Id] ?? ''/*no id by default*/;

  // == Handler ===================================================================
  const handleAddValue = (label: string, focus?: boolean) => {
    const newValue: ChipValue = { label, value: getValueFromLabel(editor, label) };
    handleChange([...chips, newValue]);
  };

  const handleChange = (chips: ChipValue[], focus?: boolean) => {
    if(chips.length > 1) log.error('CodeBlockReferenceChipSelector: only one reference is allowed');

    // gets the value from the array since only one is allowed and is stored as a
    // single string
    const newValue = chips.length > 0 ? chips[0].value : undefined;
    updateAttribute(newValue, focus);
  };

  // SEE: CodeBlockReferencesChipSelector.tsx
  const handleChipClick = (chip: ChipValue) => focusCodeBlock(editor, chip.label/*visual id*/);

  // == UI ========================================================================
  const chips = value.map(chip => ({ label: getLabelFromValue(editor, chip), value: chip }));

  return (
    <InputToolItemContainer name={'Reference'}>
      <ChipTool
        nodeId={id}
        value={chips}
        maxValues={1}
        isDraggable={false}
        validate={(visualId) => validateChip(editor, visualId)}
        onAddValue={handleAddValue}
        onChange={handleChange}
        onChipClick={handleChipClick}
      />
    </InputToolItemContainer>
  );
};

