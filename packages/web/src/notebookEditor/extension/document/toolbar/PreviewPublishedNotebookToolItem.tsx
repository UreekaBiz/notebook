import { Box, Button, CloseButton, Portal } from '@chakra-ui/react';
import { useCallback, useEffect, useState } from 'react';

import { DATA_NODE_TYPE, nodeToContent } from '@ureeka-notebook/web-service';

import { NotebookViewer, NOTEBOOK_VIEWER_ID } from 'notebookEditor/component/NotebookViewer';
import { isValidHTMLElement } from 'notebookEditor/extension/util/parse';
import { EditorToolComponentProps } from 'notebookEditor/sidebar/toolbar/type';

// ********************************************************************************
// == Interface ===================================================================
interface Props extends EditorToolComponentProps {/*no additional*/}

// == Component ===================================================================
export const PreviewPublishedNotebookToolItem: React.FC<Props> = ({ editor }) => {
  const { view } = editor;
  const { doc, selection } = editor.state;
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

  useEffect(() => {
    setTimeout(() => {
      const notebookViewer = document.getElementById(NOTEBOOK_VIEWER_ID);
      if(!notebookViewer) return/*not rendered yet, nothing to do*/;

      const { $from, from } = selection;
      const parentTextContent = doc.textBetween(from - $from.parentOffset, from);

      const matchedNodes = getHTMLNodesWithMatchingContent(notebookViewer, $from.parent.type.name, parentTextContent, [/*initially empty*/]);
      if(!(matchedNodes.length > 0)) return/*no matched nodes, nothing to do*/;

      // focus the matched Node that is closest to the currentPos in the View's
      // DOM, so that if several Nodes have the same Text, the
      // closest one is scrolled into View in the renderer
      let currentClosestNode = matchedNodes[matchedNodes.length-1/*last element*/]/*default*/;
      let currentClosesDistance = matchedNodes[matchedNodes.length-1/*last element*/].getBoundingClientRect().top/*default*/;

      for(let i=0; i<matchedNodes.length; i++) {
        const distance = Math.abs(from - matchedNodes[i].getBoundingClientRect().top);
        if(distance <= currentClosesDistance) {
          currentClosesDistance = distance;
          currentClosestNode = matchedNodes[i];
        } /* else -- not the closest Node, ignore */
      }

      currentClosestNode.scrollIntoView({ block: 'center', inline: 'center' });
    }/*after rendering the notebookViewer*/);
  }, [view, doc, selection, isOpen]);


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

// == Util ========================================================================
// iterate recursively through the children of an HTMLElement and add it to the
// array of returned Nodes if it has the given content inside its innerText
// and is of the given type
const getHTMLNodesWithMatchingContent = (node: HTMLElement, parentTypeName: string, content: string, matchedNodes: HTMLElement[]) => {
  for(let i=0; i <node.childNodes.length; i++) {
    let child = node.childNodes[i];
    if(isValidHTMLElement(child)) {
      getHTMLNodesWithMatchingContent(child, parentTypeName, content, matchedNodes);
    } /* else -- ignore */

    const dataNodeType = node.getAttribute(DATA_NODE_TYPE);
    if(dataNodeType === parentTypeName && node.innerText.includes(content)) {
      matchedNodes.push(node);
    } /* else -- ignore */
  }

  return matchedNodes;
};
