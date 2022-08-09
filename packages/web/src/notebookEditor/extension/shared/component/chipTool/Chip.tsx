import { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { Identifier } from 'dnd-core';

import { CHIP_CLASS, CHIP_CLOSE_BUTTON_CLASS } from 'notebookEditor/theme/theme';

// ********************************************************************************
// == Constant ====================================================================
// -- Type ------------------------------------------------------------------------
export type ChipDraggableItem = { id: string; index: number; }
const chipObjectType = { CHIP: 'chip' };

// == Component ===================================================================
interface Props {
  id: string;
  text: string;
  index: number;
  moveChip: (dragIndex: number, hoverIndex: number) => void;
  clickCallback: (chipText: string) => void;
  dropCallback: (item: ChipDraggableItem) => void;
  closeButtonCallback: (deletedIndex: number) => void;
}
export const Chip: React.FC<Props> = ({ id, text, index, moveChip, clickCallback, dropCallback, closeButtonCallback }) => {
  const ref = useRef<HTMLDivElement>(null);

  // == Handler ===================================================================
  const handleClick = () => clickCallback(text);

  const handleDelete = (event: React.MouseEvent<HTMLSpanElement, MouseEvent>) => {
    event.stopPropagation()/*do not trigger handleClick*/;
    closeButtonCallback(index);
  };

  // == Drag ======================================================================
  const [{ isDragging }, drag] = useDrag({
    type: chipObjectType.CHIP,
    item: (): ChipDraggableItem => { return { id, index }; },
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  });

  // == Drop ======================================================================
  const [{ handlerId }, drop] = useDrop<ChipDraggableItem, ChipDraggableItem, { handlerId: Identifier | null; }>({
    accept: chipObjectType.CHIP,
    collect(monitor) { return { handlerId: monitor.getHandlerId() }; },

    hover(item: ChipDraggableItem, monitor) {
      if(!ref.current) return;

      const dragIndex = item.index;
      const hoverIndex = index;

      if(dragIndex === hoverIndex) return/*same index*/;

      // determine rectangle on screen
      const hoverBoundingRect = ref.current.getBoundingClientRect();

      // get horizontal middle
      const xMiddleOfBoundingRect = Math.ceil((hoverBoundingRect.right - hoverBoundingRect.left) / 2);

      const clientOffset = monitor.getClientOffset();
      if(!clientOffset) return;

      // get pixels from current pos to the left
      const distanceToLeftSide = clientOffset.x - hoverBoundingRect.left;

      // when dragging to the left, only move when distance to the left is less than the middle
      if(dragIndex < hoverIndex && xMiddleOfBoundingRect > distanceToLeftSide) return;

      // when dragging to the right, only move when distance to the left is bigger than the middle
      if(dragIndex > hoverIndex && xMiddleOfBoundingRect < distanceToLeftSide) return;

      // move the chip
      moveChip(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },

    drop(item) {
      dropCallback(item);
      return item;
    },
  });

  // == Setup =====================================================================
  drag(drop(ref));

  // == UI ========================================================================
  const opacity = isDragging ? 0 : 1;
  return (
    <div ref={ref} className={CHIP_CLASS} style={{ opacity }} data-handler-id={handlerId} onClick={handleClick}>
      {text}
      <span className={CHIP_CLOSE_BUTTON_CLASS} tabIndex={0/*(SEE: notebookEditor/toolbar/type)*/} onClick={handleDelete}>&times;</span>
    </div>
  );
};
