import { Flex } from '@chakra-ui/react';
import React, { useCallback, useEffect, useState } from 'react';

import { Chip, ChipDraggableItem } from './Chip';

// ********************************************************************************
// == Constant ====================================================================
// -- Type ------------------------------------------------------------------------
type Chip = { id: number; text: string; }

// == Component ===================================================================
interface Props {
  chipStringArray: string[];
  chipClickCallback: (chipText: string) => void;
  chipDropCallback: (item: ChipDraggableItem) => void;
  chipCloseButtonCallback: (deletedIndex: number) => void;
}
export const ChipContainer: React.FC<Props> = ({ chipStringArray, chipClickCallback, chipDropCallback, chipCloseButtonCallback }) => {
  // == State =====================================================================
  const [chips, setChips] = useState<Chip[]>([]);

  // == Effect ====================================================================
  useEffect(() => {
    const chips: Chip[] = chipStringArray.map((chipString, chipIndex) => ({ id: chipIndex, text: chipString }));

    setChips(chips);
  }, [chipStringArray]);

  // == Handler ===================================================================
  const moveChip = useCallback((dragIndex: number, hoverIndex: number) => {
    const newChips = [...chips],
          draggedChip = newChips[dragIndex];

    // remove the dragged chip from the array
    newChips.splice(dragIndex, 1);

    // insert draggedChip at hover position
    newChips.splice(hoverIndex, 0, draggedChip);
    setChips(newChips);
  }, [chips]);

  // == UI ======================================================================
  return (
    <Flex flexDir='row' flexWrap='wrap' gap='1'>
      {chips.map((chip, chipIndex) =>
        <Chip
          key={chip.id}
          index={chipIndex}
          id={chip.id.toString()}
          text={chip.text}
          moveChip={moveChip}
          clickCallback={chipClickCallback}
          dropCallback={(item) => chipDropCallback(item)}
          closeButtonCallback={chipCloseButtonCallback}
        />
      )}
    </Flex>
  );
};
