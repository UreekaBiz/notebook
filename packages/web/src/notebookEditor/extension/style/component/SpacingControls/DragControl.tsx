import { Box } from '@chakra-ui/react';
import { useEffect, useRef, useState, MouseEventHandler } from 'react';

import { separateUnitFromString } from 'notebookEditor/theme/type';

// ********************************************************************************
const SENSITIVITY = 0.5;

// ********************************************************************************
interface Props {
  valueWithUnit: string;
  direction: 'vertical' | 'horizontal';

  onChange: (valueWithUnit: string) => void;
  onEnd: () => void;
}
export const DragControl: React.FC<Props> = ({ valueWithUnit, direction, onChange, onEnd }) => {
  const [isMoving, setIsMoving] = useState(false/*by contract*/);
  const [startingMousePosition, setStartingMousePosition] = useState(0);
  const [value, unit] = separateUnitFromString(valueWithUnit);
  // NOTE: if the value is an empty string or undefined, it will be treated as 0.
  //       This is the expected behavior.
  const [startingValue, setStartingValue] = useState(Number(value)/*by contract*/);
  // Poor implementation of throttle. -- Limits the rate of how often onChange is called.
  const canUpdate = useRef(true/*initial value*/);

  // == Effects ===================================================================
  useEffect(() => {
    if(!isMoving) return;/*nothing to do*/

    let newValue = startingValue;
    const handleMouseMove = (event: MouseEvent) => {
      if(!canUpdate.current) return/*not time yet to execute*/;
// console.log(startingMousePosition);
      canUpdate.current = false;
      setTimeout(() => canUpdate.current = true, 100);

      const diff = direction === 'vertical' ? startingMousePosition - event.clientY : event.clientX - startingMousePosition;
      newValue = startingValue + Math.round(diff* SENSITIVITY);
      onChange(`${newValue}${unit}`);
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
    // NOTE: This effect depends only on isMoving since it adds and remove the
    //       event listener when this value toggles, if another dependency is
    //       used then it must be ignored or take with extra care.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMoving, onChange]);

  useEffect(() => {
    if(!isMoving) return/*nothing to do*/;

    const handleMouseUp = () =>{
      setIsMoving(false);
      onEnd();
    };
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isMoving, onEnd]);

  // In a collaborative environment the valueWithUnit could change while a user is
  // changing this value, for this reason a local value must be stored and the
  // distinction on updating must be made, the value will be updated only when the
  // user is not updating.
  useEffect(() => {
    if(isMoving) return/*nothing to do*/;

    // Sync starting value
    setStartingValue(Number(value));

    // Explicitly ignore isMoving since this only depends on valueWithUnit
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  // == Handlers ==================================================================
  const handleMouseDown: MouseEventHandler<HTMLDivElement> = (event) => {
    const startingPosition = direction === 'vertical' ? event.clientY : event.clientX;
    setStartingMousePosition(startingPosition);
    setIsMoving(true);
  };

  // == UI ========================================================================
  return (
    <Box userSelect='none' onMouseDown={handleMouseDown}>{value}{unit}</Box>
  );
};
