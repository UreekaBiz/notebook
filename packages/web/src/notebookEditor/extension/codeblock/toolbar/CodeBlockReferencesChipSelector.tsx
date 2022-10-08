import { useEffect } from 'react';

import { getSelectedNode, updateSingleNodeAttributesCommand, AttributeType, NodeName, DATA_VISUAL_ID } from '@ureeka-notebook/web-service';

import { focusCodeBlock, getLabelFromValue, getValueFromLabel, isValidCodeBlockReference, validateChip } from 'notebookEditor/extension/codeblock/util';
import { ChipValue } from 'notebookEditor/extension/shared/component/chipTool/Chip';
import { ChipToolItem } from 'notebookEditor/extension/shared/component/chipTool/ChipToolItem';
import { EditorToolComponentProps } from 'notebookEditor/sidebar/toolbar/type';

// ********************************************************************************
// NOTE: This component is meant to be used with nodes that requires multiple
//       references to be selected.
interface Props extends EditorToolComponentProps {
  nodeName: NodeName;
}
export const CodeBlockReferencesChipSelector: React.FC<Props> = ({ editor, depth, nodeName, ...props }) => {
  const { state } = editor,
        { selection } = state;
  const node = getSelectedNode(state, depth);

  // == Effect ====================================================================
  /** doing CMD + Click on a VisualId toggles it from the CodeBlockReferences */
  useEffect(() => {
    if(!node) return/*nothing to do*/;
    const references = (node.attrs[AttributeType.CodeBlockReferences] ?? [] /*default*/) as string[];

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

      // toggles the visualId from the CodeBlockReferences
      const newValue = references.includes(codeblockId) ? references.filter(ref => ref !== codeblockId) : [...references, codeblockId];
      updateSingleNodeAttributesCommand(node.type.name as NodeName/*by definition*/, selection.$anchor.pos, { [AttributeType.CodeBlockReferences]: newValue })(editor.state, editor.view.dispatch);
      // no need to focus editor again
    };

    window.addEventListener('mousedown', handler);

    // removes the listener on unmount
    return () => { window.removeEventListener('mousedown', handler); };
  }, [editor, nodeName, node, selection, state.selection.anchor]);

  // == Handler ===================================================================
  // SEE: CodeBlockReferenceChipSelector.tsx
  const handleChipClick = (chip: ChipValue) => focusCodeBlock(editor, chip.label/*visual id*/);

  // == UI ========================================================================
  return (
    <ChipToolItem
      editor={editor}
      nodeName={nodeName}
      depth={depth}
      {...props}

      name='References'
      placeholder='References'
      attributeType={AttributeType.CodeBlockReferences}
      getLabelFromValue={visualId => getLabelFromValue(editor, visualId)}
      getValueFromLabel={label => getValueFromLabel(editor, label)}
      validate={label => validateChip(editor, label)}
      onChipClick={handleChipClick}
    />
  );
};
