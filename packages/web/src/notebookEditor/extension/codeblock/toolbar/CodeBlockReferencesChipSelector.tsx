import { useEffect } from 'react';

import { getLogger, getSelectedNode, isNodeSelection, AttributeType, Logger, NodeName, DATA_VISUAL_ID, REMOVED_CODEBLOCK_VISUALID } from '@ureeka-notebook/web-service';

import { focusCodeBlock, visualIdFromCodeBlockReference } from 'notebookEditor/extension/codeblock/util';
import { ChipValue } from 'notebookEditor/extension/shared/component/chipTool/Chip';
import { ChipToolItem } from 'notebookEditor/extension/shared/component/chipTool/ChipToolItem';
import { EditorToolComponentProps } from 'notebookEditor/toolbar/type';

import { isValidCodeBlockReference } from '../util';

const log = getLogger(Logger.NOTEBOOK);

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
      editor.commands.updateAttributes(nodeName, { [AttributeType.CodeBlockReferences]: newValue });

      // set the selection in the same position in case that the node was replaced
      const position = state.selection.$anchor.pos;
      if(isNodeSelection(selection)) editor.commands.setNodeSelection(position);
      else editor.commands.setTextSelection(position);

      // no need to focus editor again
    };

    window.addEventListener('mousedown', handler);

    // removes the listener on unmount
    return () => { window.removeEventListener('mousedown', handler); };
  }, [editor, nodeName, node, selection, state.selection.$anchor.pos]);

  // == Handler ===================================================================
  // SEE: CodeBlockReferenceChipSelector.tsx
  const getValueFromLabel = (visualId: string) => {
    const codeBlockReference = isValidCodeBlockReference(editor, visualId);
    if(!codeBlockReference.isValid) return ''/*invalid empty string*/;
    const codeBlockView = codeBlockReference.codeBlockView,
          codeBlock = codeBlockView.node,
          codeBlockAttributes = codeBlock.attrs,
          codeBlockId = codeBlockAttributes[AttributeType.Id];
    // log the error but return the empty string
    if(!codeBlockId) log.error('CodeBlockReferencesChipSelector: codeBlockId is missing in visualId: ', visualId);
    return codeBlockId ?? '';
  };

  // SEE: CodeBlockReferenceChipSelector.tsx
  const getLabelFromValue = (codeBlockReference: string) =>
    visualIdFromCodeBlockReference(editor, codeBlockReference) ?? REMOVED_CODEBLOCK_VISUALID;

  // SEE: CodeBlockReferenceChipSelector.tsx
  /** validates if the visual id is valid for the chip */
  const validate = (visualId: string): boolean => {
    const codeBlockReference = isValidCodeBlockReference(editor, visualId/*visual id*/);
    return codeBlockReference.isValid;
  };

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
      attributeType={AttributeType.CodeBlockReferences}
      getLabelFromValue={getLabelFromValue}
      getValueFromLabel={getValueFromLabel}
      validate={validate}
      onChipClick={handleChipClick}
    />
  );
};
