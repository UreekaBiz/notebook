import { Box, Flex, Text } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

import { isBlank, HeadingNodeType, NodeIdentifier, NodeName } from '@ureeka-notebook/web-service';

import { useNotebookEditor } from 'notebookEditor/hook/useNotebookEditor';
import { focusEditor, getFocusedNodeIdFromURL } from 'notebookEditor/util';
import { Loading } from 'shared/component/Loading';

import { Outline as OutlineType } from '../type';
import { createOutline, updateOutline } from '../util';

// ********************************************************************************
export const Outline: React.FC = () => {
  const { editor, editorService } = useNotebookEditor();
  const router = useRouter();

  // NOTE: using window.location instead of router.asPath since the URL is updated
  //       using the window API directly instead of using the router API since the
  //       change is not triggered by a user action but by the editor itself.
  const focusedNodeId = getFocusedNodeIdFromURL(window.location.href);

  // == State =====================================================================
  const [outline, setOutline] = useState<OutlineType | null/*not loaded*/>(null/*initially empty*/);

  // == Effect ====================================================================
  // Compute the full outline doing a full read of the document on first render.
  // Subscribes to changes to Headings in the document and updates the outline
  // accordingly.
  useEffect(() => {
    // creates the initial outline.
    let outline = createOutline(editor);
    setOutline(outline);

    const subscription = editorService.onNodes$<HeadingNodeType>(NodeName.HEADING).subscribe({
      next: (nodes) => {
        // updates the outline when a Heading is added or removed.
        // NOTE: if the updates get a disruptive change (e.g. a Heading is removed)
        //       the outline is recomputed from scratch.
        outline = updateOutline(editor, outline, nodes);
        setOutline(outline);
      },
    });

    // unsubscribe when the component is unmounted.
    return () => {
      subscription.unsubscribe();
    };
  }, [editor, editorService]);

  // == Handler ===================================================================
  const handleOutlineItemClick = (nodeId: NodeIdentifier | undefined) => {
    if(!nodeId) return/*nothing to do*/;

    focusEditor(editor, nodeId);

    // updates the route to the selected node. It will automatically focus the Node
    // and scroll down to the node.
    // SEE: NotebookEditor/extension/document/Document.ts
    // SEE: Editor.tsx
    router.push(`#${nodeId}`);
  };

  // == UI ========================================================================
  if(!outline) return <Loading />;

  // If the outline doesn't have any valid content renders a message.
  const isEmpty = outline.length === 0 || outline.every((item) => isBlank(item.label));

  return (
    <Flex
      direction='column'
      flex='1 1'
      minHeight={0}
      width='100%'
      paddingX={4}
      paddingTop={4}
      overflowY='auto'
    >
      {isEmpty ? (
        <Text
          color='#777'
          fontSize='14px'
          fontWeight='500'
          textAlign='center'
        >
          Headings you add to the document will appear here.
        </Text>
      ) : outline.map(item => {
          const { id, indentation, label } = item;

          const isSelected = focusedNodeId === id,
                isBiggest = indentation === 0;

          return (
            <Flex
              key={id}
              width='100%'
              alignItems='center'
              paddingY='6px'
              height='32px'
              color={isSelected ? '#1967D2' : isBiggest ? '#333' : '#555'}
              whiteSpace='nowrap'
              _hover={{
                color: isSelected ? '#1967D2' : isBiggest ? '#000' : '#222',
                cursor: 'pointer',
              }}
              onClick={() => handleOutlineItemClick(id)}
            >
              <Box width='20px'>
                {isSelected && <Box width='8px' height='2px' backgroundColor='#1967D2' />}
              </Box>
              <Box
                flex='1 1'
                paddingLeft={`${20 * indentation}px`}
                fontSize='16px'
                fontWeight={isBiggest ? '500' : '400'}

                textOverflow='ellipsis'
                overflow='hidden'
              >
                {label}
              </Box>
            </Flex>
          );
        })
      }
    </Flex>
  );
};

