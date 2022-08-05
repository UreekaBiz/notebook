import { Flex, Input } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import { ToolContainer } from 'notebookEditor/toolbar/ToolbarContainer';

import { ChipContainer } from './ChipContainer';
import { ChipDraggableItem } from './Chip';

// ********************************************************************************
interface Props {
  name: string;
  width: string;
  marginTop: string;
  currentChips: string[];
  updateChipsInputCallback: (addedChipValue: string) => boolean;
  chipDropCallback: (item: ChipDraggableItem) => void;
  chipCloseButtonCallback: (deletedIndex: number) => void;
}
export const ChipTool: React.FC<Props> = ({ name, width, marginTop, currentChips, updateChipsInputCallback, chipDropCallback, chipCloseButtonCallback }) => {
  // == State =====================================================================
  const [inputValue, setInputValue] = useState('');
  const [shouldUpdateChips, setShouldUpdateChips] = useState(false);

  // == Effect ====================================================================
  useEffect(() => { /*update chips on enter or tab press*/
    if(shouldUpdateChips === false) return;

    const updated = updateChipsInputCallback(inputValue);
    if(updated) setInputValue('');
    /* else -- not updated, do nothing */

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldUpdateChips/*explicitly only on shouldUpdateChips change*/]);

  // == Handler ===================================================================
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => setInputValue(event.target.value);
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if((event.code === 'Tab' || event.code === 'Enter') && inputValue.length > 0/*user not trying to focus next toolItem*/) {
      event.preventDefault();
      event.stopPropagation();

      setShouldUpdateChips(true);
      return/*work done*/;
    } /* else -- handle keydown regularly */

    setShouldUpdateChips(false);
  };

  // == UI ========================================================================
  return (
    <ToolContainer name={name} width={width} marginTop={marginTop}>
      <Flex
        flexDir='column'
        marginTop='5px'
      >
        <DndProvider backend={HTML5Backend}>
          <ChipContainer
            chipStringArray={currentChips}
            chipDropCallback={chipDropCallback}
            chipCloseButtonCallback={chipCloseButtonCallback}
          />
        </DndProvider>
        <Input
          flexBasis='70%'
          size='sm'
          marginTop='10px'
          autoComplete='off'
          placeholder='Add CodeBlock ID...'
          value={inputValue}
          variant='unstyled'
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
        />
      </Flex>
    </ToolContainer>
  );
};
