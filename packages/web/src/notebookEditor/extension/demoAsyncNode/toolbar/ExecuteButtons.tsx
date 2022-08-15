import { useToast, Box, Flex, IconButton, Tooltip, Spinner } from '@chakra-ui/react';
import { FiPlay } from 'react-icons/fi';

import { getLogger, getSelectedNode, isDemoAsyncNode, AttributeType, Logger, NodeName, REMOVED_CODEBLOCK_VISUALID } from '@ureeka-notebook/web-service';

import { visualIdFromCodeBlockReference } from 'notebookEditor/extension/codeBlockReference/util';
import { useNotebookEditor } from 'notebookEditor/hook/useNotebookEditor';
import { getNodeViewStorage } from 'notebookEditor/model/NodeViewStorage';
import { EditorToolComponentProps, TOOL_ITEM_DATA_TYPE } from 'notebookEditor/toolbar/type';
import { useAsyncStatus, useIsMounted } from 'shared/hook';

import { DemoAsyncNodeStorageType } from '../nodeView/controller';

const log = getLogger(Logger.NOTEBOOK);

// ********************************************************************************
interface Props extends EditorToolComponentProps {/*no additional*/ }
export const ExecuteButtons: React.FC<Props> = ({ editor, depth }) => {
  const { editorService, notebookId } = useNotebookEditor();
  const isMounted = useIsMounted();
  const toast = useToast();

  // == State =====================================================================
  const [executeRemoteStatus, setExecuteRemoteStatus] = useAsyncStatus();
  const [executeLocalStatus, setExecuteLocalStatus] = useAsyncStatus();

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
  // executes the remote async call in the DemoAsyncNode node view
  const handleRemoteClick = async () => {
    if(executeRemoteStatus === 'loading') return/*nothing to do*/;
    setExecuteRemoteStatus('loading');
    editor.commands.focus();

    try {
      await demoAsyncNodeView.executeRemote(notebookId, editorService);
    } catch(error) {
      log.error(`Error ocurred while executing DemoAsyncNode (${id}) in Notebook (${notebookId})`, error);
      if(!isMounted()) return/*nothing to do*/;
      toast({
        title: ' Error ocurred while executing DemoAsyncNode',
        status: 'error',
      });
    } finally {
      if(!isMounted()) return/*nothing to do*/;
      setExecuteRemoteStatus('complete');
    }
  };

  // executes the local async call in the DemoAsyncNode node view
  const handleLocalClick = async () => {
    if(executeLocalStatus === 'loading') return/*nothing to do*/;
    setExecuteLocalStatus('loading');
    editor.commands.focus();

    try {
      await demoAsyncNodeView.executeAsyncCall();
    } catch(error) {
      log.error(`Error ocurred while executing DemoAsyncNode (${id}) in Notebook (${notebookId})`, error);
      if(!isMounted()) return/*nothing to do*/;
      toast({
        title: ' Error ocurred while executing DemoAsyncNode',
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
