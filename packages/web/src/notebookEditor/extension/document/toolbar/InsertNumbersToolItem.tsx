import { useToast, Button } from '@chakra-ui/react';

import { notebookEditorInsertNumbers } from '@ureeka-notebook/web-service';

import { useNotebookEditor } from 'notebookEditor/hook/useNotebookEditor';
import { EditorToolComponentProps } from 'notebookEditor/toolbar/type';
import { useAsyncStatus, useIsMounted } from 'shared/hook';

// ********************************************************************************
interface Props extends EditorToolComponentProps {/*no additional*/}
export const InsertNumbersToolItem: React.FC<Props> = () => {
  const { notebookId } = useNotebookEditor();

  // == State =====================================================================
  const [status, setStatus] = useAsyncStatus();

  // ------------------------------------------------------------------------------
  const toast = useToast();
  const isMounted = useIsMounted();

  // == Handler ===================================================================
  const handleClick = async () => {
    if(status !== 'idle') return/*nothing to do*/;
    try {
      setStatus('loading');
      await notebookEditorInsertNumbers({ notebookId });

    } catch(error) {
      console.error(`Error inserting numbers. Reason: `, error);
      if(!isMounted()) return/*nothing to do*/;

      toast({ title: 'Unexpected error happened while inserting numbers.', status: 'warning', duration: 3000/*ms*/ });
    } finally {
      if(!isMounted()) return/*nothing to do*/;

      setStatus('idle');
    }
  };

  // == UI ========================================================================
  return (
    <Button
      colorScheme='gray'
      variant='ghost'
      size='sm'
      onClick={handleClick}
    >
      {status === 'loading' ? 'Loading...' : 'Insert Random Numbers'}
    </Button>
  );
};
