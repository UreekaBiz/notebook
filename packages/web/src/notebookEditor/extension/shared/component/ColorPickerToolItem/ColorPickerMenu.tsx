import { Box, Flex, FlexProps, Popover, PopoverArrow, PopoverContent, PopoverTrigger, Portal } from '@chakra-ui/react';
import { useCallback, useEffect, useState } from 'react';

import { FOCUS_COLOR } from 'notebookEditor/theme/theme';
import { Color } from 'notebookEditor/theme/type';

// ********************************************************************************
// == Constant ====================================================================
const selectColorButtonProps: Partial<FlexProps> = {
  alignItems: 'flex-end',
  flexDirection: 'row-reverse',
  width: 6,
  height: 6,
  borderRadius: 100,
  border: '1px solid #CCC',
  _focus: { boxShadow: 'none' },
};

// == Interface ===================================================================
interface Props {
  colors: Color[][];
  value: string;

  closeOnSelect?: boolean;

  onChange: (color: Color) => void;
}

// == Component ===================================================================
export const ColorPickerMenu: React.FC<Props> = ({ colors, closeOnSelect = true, onChange, value }) => {
  // -- State ---------------------------------------------------------------------
  const [isOpen, setIsOpen] = useState(false/*by contract*/);
  const [selectedColor, setSelectedColor] = useState(value);

  // -- Effect --------------------------------------------------------------------
  // close the menu when the user clicks outside the box. The event is cancelled by
  // handlePopoverMouseDown when the user clicks on the portal so it only gets
  // here when it's outside the portal.
  useEffect(() => {
    if(!isOpen) return/*nothing to do*/;

    const handleMouseDown: EventListener = (event) => setIsOpen(false/*close menu*/);

    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, [isOpen]);

  // -- Handler -------------------------------------------------------------------
  const toggleIsOpen = useCallback(() => setIsOpen(prevValue => !prevValue), []);

  const handlePopoverMouseDown: React.MouseEventHandler<HTMLDivElement> = (event) => {
    event.stopPropagation();
  };

  const handleColorSelection = (color: Color) => {
    if(closeOnSelect) setIsOpen(false/*close menu*/);

    setSelectedColor(color.hexCode);
    onChange(color);
  };

  // -- UI ------------------------------------------------------------------------
  return (
    <Popover placement='bottom-start' isOpen={isOpen}>
      <PopoverTrigger>
        <Box onClick={toggleIsOpen} onMouseDown={handlePopoverMouseDown}>
          <Box
            backgroundColor={value}
            _hover={{ cursor: 'pointer', backgroundColor: value }}
            {...selectColorButtonProps}
            width={8}
            height={8}
          />
        </Box>
      </PopoverTrigger>

      <Portal>
        <PopoverContent onMouseDown={handlePopoverMouseDown} _focus={{ boxShadow: 'none' }} width='fit-content'>
          <PopoverArrow />
          {colors.map((row, index) =>
            <Flex key={index}>
              {row.map(((color, index) =>
                <Box
                  id={`${color.hexCode}-${index}`}
                  key={index}
                  margin={0.5}
                  backgroundColor={color.hexCode}
                  _hover={{ cursor: 'pointer', backgroundColor: color.hexCode }}
                  onClick={() => handleColorSelection(color)}
                  {...selectColorButtonProps}
                  border={color.hexCode === selectedColor ? `2px solid ${FOCUS_COLOR}` : color.showBorder ? '1px solid #CCC'/*default*/ : ''/*none*/}
                />
              ))}
            </Flex>
          )}
        </PopoverContent>
      </Portal>
    </Popover >
  );
};
