import { Box, Flex, FlexProps, Popover, PopoverArrow, PopoverContent, PopoverTrigger, Portal, Text } from '@chakra-ui/react';
import { useCallback, useEffect, useState } from 'react';

import { FOCUS_COLOR } from 'notebookEditor/theme/theme';
import { Color } from 'notebookEditor/theme/type';

// ********************************************************************************
// == Constant ====================================================================
const selectColorButtonProps: Partial<FlexProps> = {
  alignItems: 'flex-end',
  flexDirection: 'row-reverse',
  width: 8,
  height: 8,
  borderRadius: 4,
  _focus: { boxShadow: 'none' },
};

interface Props {
  colors: Color[][];
  value: string;

  closeOnSelect?: boolean;

  onChange: (color: Color) => void;
}
export const ColorPickerMenu: React.FC<Props> = ({ colors, closeOnSelect = true, onChange, value }) => {
  // == State =====================================================================
  const [isOpen, setIsOpen] = useState(false/*by contract*/);
  const [selectedColor, setSelectedColor] = useState(''/*initial value*/);

  // == Effect ====================================================================
  // Close the menu when the user clicks outside the box. The event is cancelled by
  // handlePopoverMouseDown when the user clicks on the portal so it only gets
  // here when it's outside the portal.
  useEffect(() => {
    if(!isOpen) return/*nothing to do*/;

    const handleMouseDown: EventListener = (event) => setIsOpen(false/*close menu*/);

    document.addEventListener('mousedown', handleMouseDown);
    return () => { document.removeEventListener('mousedown', handleMouseDown); };
  }, [isOpen]);

  useEffect(() => {
    if(!isOpen) return/*nothing to do*/;

    const selectColorWithKey = (event: KeyboardEvent) => {
      if(event.ctrlKey || event.altKey || event.metaKey) return/*nothing to do*/;
      if(event.key === 'Escape') { setIsOpen(false/*close menu*/); return/*nothing else to do*/; }

      colors.forEach(row => {
        row.forEach(color => {
          if(color.key !== event.key) return/*nothing to do*/;

          if(closeOnSelect) setIsOpen(false/*close menu*/);

          onChange(color);
          setSelectedColor(color.hexCode);
        });
      });
    };

    window.addEventListener('keydown', selectColorWithKey);
    return () => { window.removeEventListener('keydown', selectColorWithKey); };
  }, [isOpen, closeOnSelect, colors, onChange]);

  // == Handler ===================================================================
  const toggleIsOpen = useCallback(() => setIsOpen(prevValue => !prevValue), []);

  const handlePopoverMouseDown: React.MouseEventHandler<HTMLDivElement> = (event) => {
    event.stopPropagation();
  };

  const handleColorSelection = (color: Color) => {
    if(closeOnSelect) setIsOpen(false/*close menu*/);

    setSelectedColor(color.hexCode);
    onChange(color);
  };

  // == UI ========================================================================
  return (
    <Popover placement='bottom' isOpen={isOpen}>
      <PopoverTrigger>
        <Box onClick={toggleIsOpen} onMouseDown={handlePopoverMouseDown}>
          <Box backgroundColor={value} _hover={{ cursor: 'pointer', backgroundColor: value }} {...selectColorButtonProps} />
        </Box>
      </PopoverTrigger>

      <Portal>
        <PopoverContent onMouseDown={handlePopoverMouseDown} _focus={{ boxShadow: 'none' }} width='fit-content'>
          <PopoverArrow />
          {colors.map((row, index) =>
            <Flex key={index} gap={1} justifyContent='space-between'>
              {row.map(((color, index) =>
                <Flex id={`${color.hexCode}-${index}`} key={index} margin={1} backgroundColor={color.hexCode} border={color.hexCode === selectedColor ? `2px solid ${FOCUS_COLOR}` : 'none'} _hover={{ cursor: 'pointer', backgroundColor: color.hexCode }} onClick={() => handleColorSelection(color)} {...selectColorButtonProps}>
                  <Text id={color.key} padding={1} color='white' fontSize={12}>
                    {color.key}
                  </Text>
                </Flex>
              ))}
            </Flex>
          )}
        </PopoverContent>
      </Portal>
    </Popover >
  );
};
