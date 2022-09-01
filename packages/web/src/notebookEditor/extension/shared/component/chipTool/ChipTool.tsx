import { Flex, Input } from '@chakra-ui/react';
import { useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import { getLogger, Logger } from '@ureeka-notebook/web-service';

import { TOOL_ITEM_DATA_TYPE } from 'notebookEditor/toolbar/type';

import { Chip, ChipValue } from './Chip';

const log = getLogger(Logger.NOTEBOOK);

// ********************************************************************************
export const CHIP_TOOL_INPUT = 'chipToolInput';

interface Props {
  /** the id of Node */
  nodeId?: string;

  /** the actual value of the tool. */
  value: ChipValue[];
  /** the maximum amount of allowed values */
  maxValues?: number;

  /** can ChipValues be duplicated? */
  allowDuplicates?: boolean;

  /** are chips draggable? */
  isDraggable?: boolean;

  /** callback to be called to validate if the chip label is valid.*/
  validate: (label: string) => boolean;
  onAddValue: (label: string, focus?: boolean) => void;
  onChange: (value: ChipValue[], focus?: boolean) => void;
  onChipClick?: (chip: ChipValue, index: number) => void;
}

export const ChipTool: React.FC<Props> = ({ nodeId, value, maxValues, isDraggable = true, allowDuplicates = false, validate, onAddValue, onChange, onChipClick }) => {
  // == State =====================================================================
  const [inputValue, setInputValue] = useState('');

  // == Handler ===================================================================
  // -- Input ---------------------------------------------------------------------
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => setInputValue(event.target.value);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if(event.code !== 'Tab' && event.code !== 'Enter') return/*don't handle*/;
    if(inputValue.length < 1 || !validate(inputValue)) return/*invalid chip*/;
    if(!allowDuplicates && value.find(chip => chip.label === inputValue)) return/*duplicated value -- don't create chip*/;

    event.preventDefault();
    event.stopPropagation();
    // update the input value before calling the callback
    setInputValue('');

    if(maxValues !== undefined && maxValues >= 0 && value.length >= maxValues) return/*max values reached*/;
    onAddValue(inputValue, event.code === 'Enter'/*focus on Enter*/);
  };

  // -- Chips ---------------------------------------------------------------------
  const handleChipChange = (newValue: ChipValue[], focus: boolean) => {
    // gets the amount of values in range
    if(maxValues !== undefined) {
      if(newValue.length > maxValues) log.error('ChipTool: max values reached. Ignoring overflowing items.');
      newValue = newValue.slice(0, maxValues);
    }

    onChange(newValue, true/*focus editor on chips change*/);
  };

  const handleMove = (from: number, to: number) => {
    const newValue = [...value],
          chip = newValue[from];

    // remove the dragged chip from the array
    newValue.splice(from, 1);
    // insert chip at hover position
    newValue.splice(to, 0, chip);
    handleChipChange(newValue, false/*don't focus while moving*/);
  };

  // currently it does nothing
  const handleDrop = (chip: ChipValue, index: number) => {
    handleChipChange(value, false/*focus on dropping*/);
  };

  const handleDelete = (index: number) => {
    const newValue = [...value];

    // remove the dragged chip from the array
    newValue.splice(index, 1);
    handleChipChange(newValue, false/*don't focus while deleting*/);
  };

  // == UI ========================================================================
  return (
    <DndProvider backend={HTML5Backend}>
      <Flex flexDir='row' flexWrap='wrap' gap='1' minHeight='1.75em'>
        {value.map((chip, index) => {
          const key = `${chip.value}-${index}`;
          return (
            <Chip
              key={key}
              id={key}
              value={chip}
              index={index}
              isDraggable={isDraggable}
              onMove={handleMove}
              onClick={() => onChipClick && onChipClick(chip, index)}
              onDrop={(item) => handleDrop(chip, item.index)}
              onClose={() => handleDelete(index)}
            />
          );
        })}
        {(maxValues === undefined || value.length < maxValues) && (
          <Input
            id={`${nodeId}-${CHIP_TOOL_INPUT}`}
            size='sm'
            autoComplete='off'
            placeholder='CodeBlock Id'
            value={inputValue}
            variant='unstyled'
            width='90px'
            datatype={TOOL_ITEM_DATA_TYPE/*(SEE: notebookEditor/toolbar/type )*/}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
          />
        )}
      </Flex>
    </DndProvider>
  );
};
