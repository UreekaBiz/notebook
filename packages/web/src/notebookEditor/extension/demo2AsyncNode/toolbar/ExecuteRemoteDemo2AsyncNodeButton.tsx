import { useToast, IconButton, Spinner, Tooltip } from '@chakra-ui/react';
import { FiPlay } from 'react-icons/fi';

import { getSelectedNode, isDemo2AsyncNode, getLogger, AttributeType, Logger, NodeName } from '@ureeka-notebook/web-service';

import { useNotebookEditor } from 'notebookEditor/hook/useNotebookEditor';
import { getNodeViewStorage } from 'notebookEditor/model/NodeViewStorage';
import { EditorToolComponentProps, TOOL_ITEM_DATA_TYPE } from 'notebookEditor/toolbar/type';
import { useAsyncStatus, useIsMounted } from 'shared/hook';

import { Demo2AsyncNodeStorageType } from '../nodeView/controller';

const log = getLogger(Logger.NOTEBOOK);

// ********************************************************************************
interface Props extends EditorToolComponentProps {/*no additional*/ }
export const ExecuteRemoteDemo2AsyncNodeButton: React.FC<Props> = ({ editor, depth }) => {
  const { editorService, notebookId } = useNotebookEditor();
  const isMounted = useIsMounted();
  const toast = useToast();

  // == State =====================================================================
  const [status, setStatus] = useAsyncStatus();

  // ------------------------------------------------------------------------------
  const node = getSelectedNode(editor.state, depth);
  if(!node || !isDemo2AsyncNode(node)) return null/*nothing to render -- silently fail*/;
  const { attrs } = node;
  const id = attrs[AttributeType.Id];
  if(!id) return null/*nothing to render -- silently fail*/;

  const demo2AsyncNodeViewStorage = getNodeViewStorage<Demo2AsyncNodeStorageType>(editor, NodeName.DEMO_2_ASYNC_NODE),
        demo2AsyncNodeView = demo2AsyncNodeViewStorage.getNodeView(id);
  if(!demo2AsyncNodeView) return null/*nothing to render -- silently fail*/;

  const disabled = false/*FIXME -- development*/;

  // == Handler ===================================================================
  // executes the async call in the Demo2AsyncNode node view
  const handleClick = async () => {
    if(status === 'loading') return/*nothing to do*/;

    setStatus('loading');
    try {
      await demo2AsyncNodeView.executeServerSide(notebookId, editorService);
    } catch(error){
      log.error(`Error ocurred while executing Demo2AsyncNode ${id} in notebook ${notebookId}`, error);
      if(!isMounted()) return/*nothing to do*/;
      toast({
        title:' Error ocurred while executing Demo2AsyncNode',
        status: 'error',
      });
    } finally {
      if(!isMounted()) return/*nothing to do*/;
      setStatus('complete');
    }
  };

  // == UI ========================================================================
  return (
    <Tooltip label={disabled ? ''/*none*/ : 'Execute Remotely'} hasArrow>
      <IconButton
        isDisabled={status === 'loading' || disabled}
        icon={status === 'loading' ? <Spinner size='sm' /> : <FiPlay color='blue' fill='blue' size='16px' />}
        size='xs'
        variant='ghost'
        marginY='5px'
        marginLeft='10px'
        aria-label='execute'
        datatype={disabled ? ''/*none*/ : TOOL_ITEM_DATA_TYPE/*(SEE:notebookEditor/toolbar/type)*/}
        rounded={100}
        onClick={handleClick}
      />
    </Tooltip>
  );
};
