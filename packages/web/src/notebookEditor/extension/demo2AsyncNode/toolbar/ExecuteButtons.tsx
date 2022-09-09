import { useToast, Box, Flex, IconButton, Tooltip, Spinner } from '@chakra-ui/react';
import { useEffect } from 'react';
import { FiPlay } from 'react-icons/fi';

import { getSelectedNode, getLogger, isDemo2AsyncNode, AttributeType, Logger, NodeName, NotebookEditorService, NotebookIdentifier } from '@ureeka-notebook/web-service';

import { useNotebookEditor } from 'notebookEditor/hook/useNotebookEditor';
import { getNodeViewStorage } from 'notebookEditor/model/NodeViewStorage';
import { EditorToolComponentProps, TOOL_ITEM_DATA_TYPE } from 'notebookEditor/toolbar/type';
import { useIsMounted } from 'shared/hook';

import { Demo2AsyncNodeController, Demo2AsyncNodeStorageType } from '../nodeView/controller';

const log = getLogger(Logger.NOTEBOOK);

// ********************************************************************************
interface Props extends EditorToolComponentProps {/*no additional*/ }
export const ExecuteButtons: React.FC<Props> = ({ editor, depth }) => {
  const { editorService, notebookId } = useNotebookEditor();
  const isMounted = useIsMounted();
  const toast = useToast();

  const node = getSelectedNode(editor.state, depth);
  if(!node || !isDemo2AsyncNode(node)) return null/*nothing to render -- silently fail*/;
  const id = node.attrs[AttributeType.Id];
  if(!id) return null/*nothing to render -- silently fail*/;

  const demo2AsyncNodeViewStorage = getNodeViewStorage<Demo2AsyncNodeStorageType>(editor, NodeName.DEMO_2_ASYNC_NODE),
        demo2AsyncNodeView = demo2AsyncNodeViewStorage.getNodeView(id);
  if(!demo2AsyncNodeView) return null/*nothing to render -- silently fail*/;

  const { textContent } = demo2AsyncNodeView.node;
  const { textToReplace } = demo2AsyncNodeView.node.attrs;

  const isLoading = demo2AsyncNodeView.nodeModel.getPerformingAsyncOperation();
  const disabled = !(textToReplace && textToReplace.length > 0)
                || !(textContent.includes(textToReplace))
                || (textContent.length < 1)
                || isLoading;

  // == Handler ===================================================================
  // executes the remote async call in the Demo2AsyncNode NodeView
  const handleRemoteClick = async () => {
    if(isLoading) return/*nothing to do*/;
    editor.commands.focus();

    try {
      await demo2AsyncNodeView.executeRemote(notebookId, editorService);
    } catch(error) {
      log.error(`Error ocurred while executing Demo 2 Async Node (${id}) in Notebook (${notebookId})`, error);
      if(!isMounted()) return/*nothing to do*/;
      toast({
        title:' Error ocurred while executing Demo 2 Async Node',
        status: 'error',
      });
    } finally {
      if(!isMounted()) return/*nothing to do*/;
    }
  };

  // executes the local async call in the DemoAsyncNode NodeView
  const handleLocalClick = async () => {
    if(isLoading) return/*nothing to do*/;
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
    }
  };

  // == UI ========================================================================
  return (
    <Flex>
      <ExecuteShortcut notebookId={notebookId} editorService={editorService} demo2AsyncNodeView={demo2AsyncNodeView} disabled={disabled} />
      <Box marginRight={1} >
        <Tooltip label={disabled ? ''/*none*/ : 'Execute Remotely'} hasArrow>
          <IconButton
            isDisabled={disabled}
            icon={isLoading ? <Spinner size='sm' /> : <FiPlay color='blue' fill='blue' size='16px' />}
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
            isDisabled={disabled}
            icon={isLoading ? <Spinner size='sm' /> : <FiPlay size='16px' />}
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

// ================================================================================
// TODO: Refactor into some kind of general component that handle shortcuts.
type ExecuteShortcutProps = {
  notebookId: NotebookIdentifier;
  editorService: NotebookEditorService;
  demo2AsyncNodeView: Demo2AsyncNodeController;
  disabled: boolean;
}
const ExecuteShortcut: React.FC<ExecuteShortcutProps> = ({ editorService, notebookId, demo2AsyncNodeView, disabled }) => {
  // == Effect ====================================================================
  // executed the DAN when the user presses CMD + Enter
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if(disabled) return/*execution not allowed, nothing to do*/;
      if(demo2AsyncNodeView.nodeModel.getPerformingAsyncOperation()) return/*don't execute if already loading*/;
      if(event.key !== 'Enter' || !event.metaKey) return/*nothing to do*/;

      demo2AsyncNodeView.executeRemote(notebookId, editorService);
    };

    window.addEventListener('keydown', handler);
    return () => { window.removeEventListener('keydown', handler); };
  }, [notebookId, editorService, demo2AsyncNodeView, disabled]);

  return null/*do not display anything, just add Effect*/;
};
