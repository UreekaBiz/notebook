import { Flex, Input } from '@chakra-ui/react';
import { useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import { ToolContainer } from 'notebookEditor/toolbar/ToolbarContainer';
import { TOOL_ITEM_DATA_TYPE } from 'notebookEditor/toolbar/type';

import { ChipContainer } from './ChipContainer';
import { ChipDraggableItem } from './Chip';

// ********************************************************************************
// == Constant ====================================================================
export const CHIP_TOOL_INPUT = 'chipToolInput';

// == Interface ===================================================================
interface Props {
  nodeId: string;
  name: string;
  width: string;
  marginTop: string;
  currentChips: string[];
  updateChipsInputCallback: (addedChipValue: string) => boolean;
  chipClickCallback: (chipText: string) => void;
  chipDropCallback: (item: ChipDraggableItem) => void;
  chipCloseButtonCallback: (deletedIndex: number) => void;
}

// == Component ===================================================================
export const ChipTool: React.FC<Props> = ({ nodeId, name, width, marginTop, currentChips, updateChipsInputCallback, chipClickCallback, chipDropCallback, chipCloseButtonCallback }) => {
  // -- State ---------------------------------------------------------------------
  const [inputValue, setInputValue] = useState('');

  // -- Handler -------------------------------------------------------------------
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => setInputValue(event.target.value);
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if((event.code === 'Tab' || event.code === 'Enter') && inputValue.length > 0/*user not trying to focus next toolItem*/) {
      event.preventDefault();
      event.stopPropagation();

      const chipsUpdated = updateChipsInputCallback(inputValue);
      if(chipsUpdated) {
        setInputValue('');
      } /* else -- do not reset inputValue */

      return/*work done*/;
    } /* else -- handle keydown regularly */
  };

  // -- UI ------------------------------------------------------------------------
  return (
    <ToolContainer name={name} width={width} marginTop={marginTop}>
      <Flex
        flexDir='column'
        marginTop='5px'
      >
        <DndProvider backend={HTML5Backend}>
          <ChipContainer
            chipStringArray={currentChips}
            chipClickCallback={chipClickCallback}
            chipDropCallback={chipDropCallback}
            chipCloseButtonCallback={chipCloseButtonCallback}
          />
        </DndProvider>
        <Input
          id={`${nodeId}-${CHIP_TOOL_INPUT}`}
          flexBasis='70%'
          size='sm'
          marginTop='10px'
          autoComplete='off'
          placeholder='Add CodeBlock ID...'
          value={inputValue}
          variant='unstyled'
          datatype={TOOL_ITEM_DATA_TYPE/*(SEE: notebookEditor/toolbar/type )*/}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
        />
      </Flex>
    </ToolContainer>
  );
};
