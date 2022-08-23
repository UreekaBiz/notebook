import { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { Identifier } from 'dnd-core';

import { CHIP_CLASS, CHIP_CLOSE_BUTTON_CLASS } from 'notebookEditor/theme/theme';

// ********************************************************************************
// == Constant ====================================================================
// -- Type ------------------------------------------------------------------------
export type ChipValue = { value: string; label: string;};
export type ChipDraggableItem = { id: string; index: number; }
const chipObjectType = { CHIP: 'chip' };

// == Component ===================================================================
interface Props {
  id: string;

  index: number;
  value: ChipValue;

  isDraggable?: boolean;

  onClick: () => void;
  onClose: () => void;
  onDrop: (item: ChipDraggableItem) => void;
  onMove: (from: number, to: number) => void;
}
export const Chip: React.FC<Props> = ({ id, index, value, isDraggable, onMove, onClick, onDrop, onClose }) => {
  const ref = useRef<HTMLDivElement>(null);

  // == Handler ===================================================================
  const handleDelete = (event: React.MouseEvent<HTMLSpanElement, MouseEvent>) => {
    event.stopPropagation();
    onClose();
  };

  // == Drag ======================================================================
  const [{ /*nothing!*/}, drag] = useDrag({
    canDrag: isDraggable,
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
      onMove(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },

    drop(item) {
      onDrop(item);
      return item;
    },
  });

  // == Setup =====================================================================
  drag(drop(ref));

  // == UI ========================================================================
  // NOTE: Using custom implementation of the Chip component to avoid the issue of
  //       the Chip component not being able to be draggable.
  return (
    <div
      data-handler-id={handlerId}
      ref={ref}
      className={CHIP_CLASS}
      onClick={onClick}
    >
      {value.label}
      <span
        className={CHIP_CLOSE_BUTTON_CLASS}
        tabIndex={0/*(SEE: notebookEditor/toolbar/type)*/}
        onClick={handleDelete}
      >
        {/** X icon */}
        &times;
      </span>
    </div>
  );
};
