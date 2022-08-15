import { useToast, Box, Flex, IconButton, Tooltip, Spinner } from '@chakra-ui/react';
import { FiPlay } from 'react-icons/fi';

import { getLogger, isDemo2AsyncNode, AttributeType, Logger, NodeName } from '@ureeka-notebook/web-service';

import { useNotebookEditor } from 'notebookEditor/hook/useNotebookEditor';
import { getNodeViewStorage } from 'notebookEditor/model/NodeViewStorage';
import { EditorToolComponentProps, TOOL_ITEM_DATA_TYPE } from 'notebookEditor/toolbar/type';
import { useAsyncStatus, useIsMounted } from 'shared/hook';

import { Demo2AsyncNodeStorageType } from '../nodeView/controller';

const log = getLogger(Logger.NOTEBOOK);

// ********************************************************************************
interface Props extends EditorToolComponentProps {/*no additional*/ }
export const ExecuteButtons: React.FC<Props> = ({ editor }) => {
  const { editorService, notebookId } = useNotebookEditor();
  const isMounted = useIsMounted();
  const toast = useToast();

  // == State =====================================================================
  const [executeRemoteStatus, setExecuteRemoteStatus] = useAsyncStatus();
  const [executeLocalStatus, setExecuteLocalStatus] = useAsyncStatus();

  // ------------------------------------------------------------------------------
  const parentNode = editor.state.selection.$anchor.parent;
  if(!isDemo2AsyncNode(parentNode)) return null/*nothing to render -- silently fail*/;
  const id = parentNode.attrs[AttributeType.Id];
  if(!id) return null/*nothing to render -- silently fail*/;

  const demo2AsyncNodeViewStorage = getNodeViewStorage<Demo2AsyncNodeStorageType>(editor, NodeName.DEMO_2_ASYNC_NODE),
        demo2AsyncNodeView = demo2AsyncNodeViewStorage.getNodeView(id);
  if(!demo2AsyncNodeView) return null/*nothing to render -- silently fail*/;

  const { textContent } = demo2AsyncNodeView.node;
  const { textToReplace } = demo2AsyncNodeView.node.attrs;
  const disabled = !(textToReplace && textToReplace.length > 0) ||
                    !(textContent.includes(textToReplace)) ||
                    (textContent.length < 1) ||
                    demo2AsyncNodeView.nodeModel.getPerformingAsyncOperation();

  // == Handler ===================================================================
  // executes the remote async call in the Demo2AsyncNode NodeView
  const handleRemoteClick = async () => {
    if(executeRemoteStatus === 'loading') return/*nothing to do*/;
    setExecuteRemoteStatus('loading');
    editor.commands.focus();

    try {
      await demo2AsyncNodeView.executeRemote(notebookId, editorService);
    } catch(error){
      log.error(`Error ocurred while executing Demo 2 Async Node (${id}) in Notebook (${notebookId})`, error);
      if(!isMounted()) return/*nothing to do*/;
      toast({
        title:' Error ocurred while executing Demo 2 Async Node',
        status: 'error',
      });
    } finally {
      if(!isMounted()) return/*nothing to do*/;
      setExecuteRemoteStatus('complete');
    }
  };

  // executes the local async call in the DemoAsyncNode NodeView
  const handleLocalClick = async () => {
    if(executeLocalStatus === 'loading') return/*nothing to do*/;
    setExecuteLocalStatus('loading');
    editor.commands.focus();

    try {
      await demo2AsyncNodeView.executeAsyncCall();
    } catch(error) {
      log.error(`Error ocurred while executing Demo 2 Async Node (${id}) in Notebook (${notebookId})`, error);
      if(!isMounted()) return/*nothing to do*/;
      toast({
        title: ' Error ocurred while executing Demo2 Async Node',
        status: 'error',
      });
    } finally {
      if(!isMounted()) return/*nothing to do*/;
      setExecuteLocalStatus('complete');
    }
  };

  // == UI ========================================================================
  return (
    <Flex>
      <Box marginRight={1} >
        <Tooltip label={disabled ? ''/*none*/ : 'Execute Remotely'} hasArrow>
          <IconButton
            isDisabled={executeRemoteStatus === 'loading' || disabled}
            icon={executeRemoteStatus === 'loading' ? <Spinner size='sm' /> : <FiPlay color='blue' fill='blue' size='16px' />}
            size='xs'
            variant='ghost'
            marginY='5px'
            marginLeft='10px'
            aria-label='execute'
            datatype={disabled ? ''/*none*/ : TOOL_ITEM_DATA_TYPE/*(SEE:notebookEditor/toolbar/type)*/}
            rounded={100}
            onClick={handleRemoteClick}
          />
        </Tooltip>
        <Tooltip label={disabled ? ''/*none*/ : 'Execute Locally'} hasArrow>
          <IconButton
            isDisabled={executeLocalStatus === 'loading' || disabled}
            icon={executeLocalStatus === 'loading' ? <Spinner size='sm' /> : <FiPlay size='16px' />}
            size='xs'
            variant='ghost'
            marginY='5px'
            marginLeft='10px'
            aria-label='execute'
            datatype={disabled ? ''/*none*/ : TOOL_ITEM_DATA_TYPE/*(SEE:notebookEditor/toolbar/type)*/}
            rounded={100}
            onClick={handleLocalClick}
          />
        </Tooltip>
      </Box>
    </Flex>
  );
};
