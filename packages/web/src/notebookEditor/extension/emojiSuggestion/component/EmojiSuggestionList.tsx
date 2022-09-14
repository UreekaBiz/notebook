import { Box, Button } from '@chakra-ui/react';
import { Editor } from '@tiptap/core';
import React, { useEffect, useImperativeHandle, useState, ForwardedRef } from 'react';

import { SuggestionKeyDownProps, SuggestionSymbol } from '../suggestion/type';

// ********************************************************************************
// == Type ========================================================================
export type EmojiSuggestionForwardedObject = { onKeyDown: (props: SuggestionKeyDownProps) => boolean; }

// == Interface ===================================================================
export interface EmojiSuggestionListProps {
  editor: Editor;
  items: SuggestionSymbol[];
  command: (symbol: SuggestionSymbol) => void;
}

// == Component ===================================================================
export const EmojiSuggestionList = React.forwardRef((props: EmojiSuggestionListProps, ref: ForwardedRef<EmojiSuggestionForwardedObject>) => {
  // == State =====================================================================
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  // == Handler ===================================================================
  const selectItem = (index: number) => props.command(props.items[index]);
  const upHandler = () => setSelectedIndex((selectedIndex + props.items.length - 1) % props.items.length);
  const downHandler = () => setSelectedIndex((selectedIndex + 1) % props.items.length);
  const enterHandler = () => selectItem(selectedIndex);

  // handle Arrow and Enter keydown events when the Suggestion popup is open
  useImperativeHandle(ref, () => ({
    onKeyDown: (props) => {
      switch(props.event.key) {
        case ('ArrowUp'): {
          upHandler();
          return true/*handled*/;
        }
        case ('ArrowDown'): {
          downHandler();
          return true/*handled*/;
        }
        case ('Enter'): {
          enterHandler();
          return true/*handled*/;
        }

        // NOTE: since Blocks  must ignore changes on their
        //       childList mutations so that Selection works correctly,
        //       and given that removing the Tippy popup counts as one of these
        //       childList mutations, manually delete the trigger character
        //       using the range given by the Suggestion, which matches
        //       the character range of the trigger
        case ('Backspace'): {
          const { state, dispatch } = props.view;
          const { tr } = state;
          const { to } = props.range;

          // only delete 1 char, multi Selection and delete are handled regularly
          const from = to-1;

          tr.deleteRange(from, to);
          dispatch(tr);
          return true/*handled*/;
        }

        default: {
          return false/*let PM handle the event*/;
        }
      }
    },
  }));


  // == Effect ====================================================================
  useEffect(() => {
    setSelectedIndex(0/*default to first item*/);
  }, [props.items]);

  // == UI ========================================================================
  return (
    <Box
      position='relative'
      padding='0.2rem'
      overflow='hidden'
      background='#fff'
      borderRadius='0.5rem'
      boxShadow='0 0 0 1px rgba(0, 0, 0, 0.05), 0px 10px 20px rgba(0, 0, 0, 0.1)'
      color='rgba(0, 0, 0, 0.8)'
      fontSize='0.9rem'
    >
      {props.items.length
        ? props.items.map((item, index) => (
          <Button
            key={index}
            display='block'
            margin={0}
            width='100%'
            padding='0.2rem 0.4rem'
            background='transparent'
            border='1px'
            borderColor={index === selectedIndex ? '#000' : 'transparent'}
            borderRadius='0.4rem'
            textAlign='left'
            onClick={() => selectItem(index)}
          >
            {`${item.symbol} ${item.trigger}`}
          </Button>
        ))
        : <Box
            display='block'
            margin={0}
            width='100%'
            padding='0.2rem 0.4rem'
            background='transparent'
            border='1px'
            borderRadius='0.4rem'
            textAlign='left'
          >
            No result
          </Box>
      }
    </Box>
  );
});
EmojiSuggestionList.displayName = 'emojiSuggestionList';
