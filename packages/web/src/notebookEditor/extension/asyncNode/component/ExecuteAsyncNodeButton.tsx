import { useToast, Spinner } from '@chakra-ui/react';
import { Editor } from '@tiptap/core';
import { useCallback } from 'react';
import { FiPlay } from 'react-icons/fi';

import { AbstractAsyncNodeController } from 'notebookEditor/extension/asyncNode/nodeView/controller';
import { RightContentButton } from 'notebookEditor/extension/shared/component/RightContentButton';
import { useAsyncStatus } from 'shared/hook';

// ********************************************************************************
// NOTE: see NOTE at top of AbstractAsyncNodeController for 'any' type explanation
interface Props {
  editor: Editor;
  asyncNodeView: AbstractAsyncNodeController<any, any, any>;
  disabled?: boolean;
}
export const ExecuteAsyncNodeButton: React.FC<Props> = ({ editor, asyncNodeView, disabled = false }) => {
  const toast = useToast();
  const [status, setStatus] = useAsyncStatus();

  // == Callback ==================================================================
  const executeAsyncNode = useCallback(async () => {
    setStatus('loading');
    editor.view.focus();

    try {
      await asyncNodeView.executeAsyncCall();
    } catch(error) {
      // NOTE: This catches the error thrown from the asyncNodeController and
      //       displays it as a toast, to give feedback to the user. If the error
      //       is meant to be represented by the async node, then it is caught
      //       in its model call and its view is updated accordingly.
      //       (SEE: notebookEditor/extension/asyncNode/nodeView/AbstractAsyncNodeController)
      toast({ title: (error as Error).message.slice(6/*trim 'Error:'*/)/*guaranteed by above note*/, status: 'warning' });
    } finally {
      setStatus('complete');
    }
  }, [asyncNodeView, editor.view, setStatus, toast]);

  // == UI ========================================================================
  return (
    <RightContentButton
      isDisabled={status === 'loading' || disabled}
      icon={(status === 'loading' || asyncNodeView.nodeModel.getPerformingAsyncOperation()) ? <Spinner size='sm' /> : <FiPlay size='16px' />}
      clickCallback={executeAsyncNode}
    />
  );
};
