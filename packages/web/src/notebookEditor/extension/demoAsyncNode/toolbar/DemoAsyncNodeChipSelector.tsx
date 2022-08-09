import { isDemoAsyncNode, swap, AttributeType, NodeName } from '@ureeka-notebook/web-service';

import { getCodeBlockViewStorage } from 'notebookEditor/extension/codeblock/nodeView/storage';
import { isValidCodeBlockReference, visualIdsFromCodeBlockReferences } from 'notebookEditor/extension/codeBlockAsyncNode/util';
import { ChipDraggableItem } from 'notebookEditor/extension/shared/component/chipTool/Chip';
import { ChipTool } from 'notebookEditor/extension/shared/component/chipTool/ChipTool';
import { isNodeSelection } from 'notebookEditor/extension/util/node';
import { EditorToolComponentProps } from 'notebookEditor/toolbar/type';

// ********************************************************************************
interface Props extends EditorToolComponentProps {/*no additional*/}
export const DemoAsyncNodeChipSelector: React.FC<Props> = ({ editor }) => {
  const { selection } = editor.state;
  if(!isNodeSelection(selection) || !isDemoAsyncNode(selection.node)) throw new Error('Invalid DemoAsyncNodeChipTool render');

  const { attrs } = selection.node;
  const codeBlockReferences = attrs[AttributeType.CodeBlockReferences] ?? []/*default*/;
  const selectedChips = visualIdsFromCodeBlockReferences(editor, codeBlockReferences);

  // == Handler ===================================================================
  const handleChipsInputUpdate = (codeBlockVisualId: string) => {
    const codeBlockReference = isValidCodeBlockReference(editor, attrs, codeBlockVisualId);
    if(!codeBlockReference.isValid) return false/*ignore call*/;

    return editor.chain()
                 .updateAttributes(NodeName.DEMO_ASYNC_NODE, { ...attrs, codeBlockReferences: [...codeBlockReferences, codeBlockReference.codeBlockId] })
                 .setNodeSelection(selection.$anchor.pos)
                 .run();
  };

  const handleChipClick = (codeBlockVisualId: string) => {
    const codeBlockReference = isValidCodeBlockReference(editor, attrs, codeBlockVisualId);
    if(!codeBlockReference.isValid) return false/*ignore call*/;

    const codeBlockStorage = getCodeBlockViewStorage(editor);
    const codeBlockNodeView = codeBlockStorage.getNodeView(codeBlockReference.codeBlockId);
    if(!codeBlockNodeView) return false/*ignore call*/;

    return editor.commands.focus(codeBlockNodeView.getPos() + 1/*inside the CodeBlock*/ + codeBlockNodeView.node.textContent.length/*at the end of its content*/, { scrollIntoView: true/*scroll into view*/ });
  };

  const handleChipDrop = ({ id, index }: ChipDraggableItem) => {
    const movedPosition = Number(id),
          destinationPosition = Number(index);
    const newCodeBlockReferences: string[] = [...codeBlockReferences];

    // move codeBlockReference in movedPosition to destinationPosition by swapping
    swap(newCodeBlockReferences, movedPosition, destinationPosition);

    return editor.chain()
              .focus()
              .updateAttributes(NodeName.DEMO_ASYNC_NODE, { ...attrs, codeBlockReferences: newCodeBlockReferences })
              .setNodeSelection(selection.$anchor.pos)
              .run();
  };

  const handleChipClose = (deletedIndex: number) => {
    let newCodeBlockReferences = [...codeBlockReferences];
        newCodeBlockReferences.splice(deletedIndex, 1);

    return editor.chain()
              .focus()
              .updateAttributes(NodeName.DEMO_ASYNC_NODE, { ...attrs, codeBlockReferences: newCodeBlockReferences })
              .setNodeSelection(selection.$anchor.pos)
              .run();
  };

  // == UI ========================================================================
  return (
    <ChipTool
      name='Referenced Code Blocks'
      width='100%'
      marginTop='10px'
      currentChips={selectedChips}
      updateChipsInputCallback={handleChipsInputUpdate}
      chipClickCallback={handleChipClick}
      chipDropCallback={handleChipDrop}
      chipCloseButtonCallback={handleChipClose}
    />
  );
};
