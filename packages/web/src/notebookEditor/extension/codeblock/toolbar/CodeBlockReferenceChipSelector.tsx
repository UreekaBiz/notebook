import { useCallback, useEffect } from 'react';

import { getLogger, getSelectedNode, isNodeType, isNodeSelection, AttributeType, Logger, NodeName, DATA_VISUAL_ID, REMOVED_CODEBLOCK_VISUALID } from '@ureeka-notebook/web-service';

import { focusCodeBlock, visualIdFromCodeBlockReference } from 'notebookEditor/extension/codeblock/util';
import { ChipValue } from 'notebookEditor/extension/shared/component/chipTool/Chip';
import { ChipTool } from 'notebookEditor/extension/shared/component/chipTool/ChipTool';
import { InputToolItemContainer } from 'notebookEditor/extension/shared/component/InputToolItemContainer';
import { EditorToolComponentProps } from 'notebookEditor/toolbar/type';

import { isValidCodeBlockReference } from '../util';

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
    editor.commands.updateAttributes(nodeName, { [AttributeType.CodeBlockReference]: value });

    const position = state.selection.$anchor.pos;
    // set the selection in the same position in case that the node was replaced
    if(isNodeSelection(selection)) editor.commands.setNodeSelection(position);
    else editor.commands.setTextSelection(position);

    // Focus the editor again
    if(focus) editor.commands.focus();
  }, [editor.commands, nodeName, selection, state.selection.$anchor.pos]);

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
    const newValue: ChipValue = { label, value: getValueFromLabel(label) };
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
  const getValueFromLabel = (visualId: string) => {
    const codeBlockReference = isValidCodeBlockReference(editor, visualId);
    if(!codeBlockReference.isValid) return ''/*invalid empty string*/;
    const codeBlockView = codeBlockReference.codeBlockView,
          codeBlock = codeBlockView.node,
          codeBlockAttributes = codeBlock.attrs,
          codeBlockId = codeBlockAttributes[AttributeType.Id];
    // log the error but return the empty string
    if(!codeBlockId) log.error('CodeBlockReferenceChipSelector: codeBlockId is missing in visualId: ', visualId);
    return codeBlockId ?? '';
  };

  // SEE: CodeBlockReferencesChipSelector.tsx
  const getLabelFromValue = (codeBlockReference: string) =>
    visualIdFromCodeBlockReference(editor, codeBlockReference) ?? REMOVED_CODEBLOCK_VISUALID;

  // SEE: CodeBlockReferencesChipSelector.tsx
  /** validates if the visual id is valid for the chip */
  const validate = (visualId: string): boolean => {
    const codeBlockReference = isValidCodeBlockReference(editor, visualId/*visual id*/);
    return codeBlockReference.isValid;
  };

  // SEE: CodeBlockReferencesChipSelector.tsx
  const handleChipClick = (chip: ChipValue) => focusCodeBlock(editor, chip.label/*visual id*/);

  // == UI ========================================================================
  const chips = value.map(chip => ({ label: getLabelFromValue(chip), value: chip }));

  return (
    <InputToolItemContainer name={'Reference'}>
      <ChipTool
        nodeId={id}
        value={chips}
        maxValues={1}
        isDraggable={false}
        validate={validate}
        onAddValue={handleAddValue}
        onChange={handleChange}
        onChipClick={handleChipClick}
      />
    </InputToolItemContainer>
  );
};

