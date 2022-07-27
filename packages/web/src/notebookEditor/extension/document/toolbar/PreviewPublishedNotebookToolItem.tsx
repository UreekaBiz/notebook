import { Box, Button, CloseButton, Portal } from '@chakra-ui/react';
import { useEffect, useState } from 'react';

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

  // == Effects ===================================================================
  // Adds a listener to the window to toggle the modal state based on the key
  // pressed. A Special sequence of keys is used to toggle the state of isOpen. It
  // consists on CTRL + ALT/Option + ,
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

    // Remove listener on unmount.
    return () => { document.removeEventListener('keydown', handleKeyDown); };
  }, [isOpen]);

  // == Handlers ==================================================================
  const handleOpen = () => setIsOpen(true);
  const handleClose = () => setIsOpen(false);

  // == UI ========================================================================
  return (
    <>
      <Button colorScheme='gray' variant='ghost' size='sm' onClick={handleOpen}>Preview published Notebook</Button>
      <Portal>
        {isOpen && (
          <Box position='absolute' top='0' left='0' w='100vw' h='100vh' background='white'>
            <CloseButton position='absolute' top='0' right={0} onClick={handleClose} />
            <NotebookViewer content={content} />
          </Box>
        )}
      </Portal>
    </>
  );
};
