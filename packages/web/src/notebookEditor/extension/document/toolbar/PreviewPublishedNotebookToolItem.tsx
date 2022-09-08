import { Box, Button, CloseButton, Portal } from '@chakra-ui/react';
import { useCallback, useEffect, useState } from 'react';

import { nodeToContent } from '@ureeka-notebook/web-service';

import { NotebookViewer } from 'notebookEditor/component/NotebookViewer';
import { EditorToolComponentProps } from 'notebookEditor/toolbar/type';

// ********************************************************************************
interface Props extends EditorToolComponentProps {/*no additional*/}
export const PreviewPublishedNotebookToolItem: React.FC<Props> = ({ editor }) => {
  const { doc } = editor.state;
  const content = nodeToContent(doc);

  // == State =====================================================================
  const [isOpen, setIsOpen] = useState(false/*by contract*/);

  // == Effect ====================================================================
  // adds a listener to the window to toggle the modal state (CTRL + ALT/Option + ,)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if(event.key === 'Escape') { setIsOpen(false); return/*nothing else to do*/; }

      const isSequence = event.ctrlKey && event.altKey && event.code === 'Comma';
      if(isSequence) {
        event.preventDefault();
        setIsOpen(prevValue => !prevValue);
      }
    };
    document.addEventListener('keydown', handleKeyDown);

    // remove listener on unmount
    return () => { document.removeEventListener('keydown', handleKeyDown); };
  }, [isOpen]);

  // == Handler ===================================================================
  const handleOpen = useCallback(() => setIsOpen(true), []);
  const handleClose = useCallback(() => setIsOpen(false), []);

  // == UI ========================================================================
  if(isOpen) return (
    <Portal>
      <Box
        position='absolute'
        top='0'
        left='0'
        w='100%'
        h='100vh'
        overflowY='auto'
        background='white'
      >
        <CloseButton position='absolute' top='0' right={0} onClick={handleClose} />
        <NotebookViewer content={content} />
      </Box>
    </Portal>
  );

  return (
    <Button colorScheme='gray' variant='ghost' size='sm' onClick={handleOpen}>Preview published</Button>
  );

};
