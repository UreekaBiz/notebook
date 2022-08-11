import { IconButton, Spinner, useToast } from '@chakra-ui/react';
import { isDemoAsyncNode, AttributeType, NodeName, REMOVED_CODEBLOCK_VISUALID, getLogger, Logger } from '@ureeka-notebook/web-service';
import { FiPlay } from 'react-icons/fi';

import { visualIdFromCodeBlockReference } from 'notebookEditor/extension/codeBlockReference/util';
import { getSelectedNode } from 'notebookEditor/extension/util/node';
import { useNotebookEditor } from 'notebookEditor/hook/useNotebookEditor';
import { getNodeViewStorage } from 'notebookEditor/model/NodeViewStorage';
import { EditorToolComponentProps } from 'notebookEditor/toolbar/type';
import { useAsyncStatus, useIsMounted } from 'shared/hook';

import { DemoAsyncNodeStorageType } from '../nodeView/controller';

const log = getLogger(Logger.NOTEBOOK);

// ********************************************************************************
interface Props extends EditorToolComponentProps {/*no additional*/ }
export const ExecuteServerSideDemoAsyncNodeButton: React.FC<Props> = ({ editor }) => {
  const { editorService, notebookId } = useNotebookEditor();
  const isMounted = useIsMounted();
  const toast = useToast();

  // == State =====================================================================
  const [status, setStatus] = useAsyncStatus();

  // ------------------------------------------------------------------------------
  const node = getSelectedNode(editor.state);
  if(!node || !isDemoAsyncNode(node)) return null/*nothing to render -- silently fail*/;
  const { attrs } = node;

  const id = attrs[AttributeType.Id],
        codeBlockReferences = attrs[AttributeType.CodeBlockReferences] ?? []/*default*/;
  if(!id) return null/*nothing to render -- silently fail*/;

  const demoAsyncNodeViewStorage = getNodeViewStorage<DemoAsyncNodeStorageType>(editor, NodeName.DEMO_ASYNC_NODE),
        demoAsyncNodeView = demoAsyncNodeViewStorage.getNodeView(id);
  if(!demoAsyncNodeView) return null/*nothing to render -- silently fail*/;

  const disabled = codeBlockReferences.length < 1
                || codeBlockReferences.some((reference) => visualIdFromCodeBlockReference(editor, reference) === REMOVED_CODEBLOCK_VISUALID)
                || demoAsyncNodeView.nodeModel.getPerformingAsyncOperation();

  // == Handler ===================================================================
  // executes the async call in the DemoAsyncNode node view
  const handleClick = async () => {
    if(status === 'loading') return/*nothing to do*/;

    setStatus('loading');
    try {
      await demoAsyncNodeView.executeServerSide(notebookId, editorService);
    } catch(error){
      log.error(`Error ocurred while executing DemoAsyncNode ${id} in notebook ${notebookId}`, error);
      if(!isMounted()) return/*nothing to do*/;
      toast({
        title:' Error ocurred while executing DemoAsyncNode',
        status: 'error',
      });
    } finally {
      if(!isMounted()) return/*nothing to do*/;
      setStatus('complete');
    }
  };

  // == UI ========================================================================
  return (
    <IconButton
      isDisabled={status === 'loading' || disabled}
      icon={status === 'loading' ? <Spinner size='sm' /> : <FiPlay color='blue' fill='blue' size='16px' />}
      size='xs'
      variant='ghost'
      marginY='5px'
      marginLeft='10px'
      aria-label='execute'
      rounded={100}
      onClick={handleClick}
    />
  );
};