import { Input, InputGroup, InputLeftAddon } from '@chakra-ui/react';
import { ChangeEventHandler, KeyboardEventHandler } from 'react';

import { Color, colorToHexColor, removeColorAddon } from 'notebookEditor/theme/type';
import { ToolContainer } from 'notebookEditor/toolbar/ToolbarContainer';
import { useLocalValue } from 'notebookEditor/shared/hook/useLocalValue';

import { ColorPickerMenu } from './ColorPickerMenu';

// ********************************************************************************
// == Constant ====================================================================
const LEFT_ADDON_TEXT = '#';

// ================================================================================
interface Props {
  name: string;

  value: string;
  onChange: (value: string, focus?: boolean) => void;

  colors: Color[][];
}
export const ColorPicker: React.FC<Props> = ({ colors, name, onChange, value }) => {
  // == State ====================================================================
  const { commitChange, localValue, resetLocalValue, updateLocalValue } = useLocalValue(value, onChange);

  // == Handlers ==================================================================
  const handleColorPickerChange = (color: Color) => {
    const value = color.hexCode;
    updateLocalValue(value);
    commitChange(value);
  };

  const handleInputChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    const value = colorToHexColor(event.target.value);
    updateLocalValue(value);
  };

  const saveChange = (focus: boolean = true/*focus editor by default*/) => {
    if(localValue) commitChange(undefined/*use stored value*/, focus);
    else resetLocalValue();
  };

  const handleKeyDown: KeyboardEventHandler<HTMLInputElement> = (event) => {
    // Save changes when user presses enter
    if(event.key === 'Enter') saveChange();
  };

  // == UI ========================================================================
  return (
    <ToolContainer name={name} width='auto'>
     <InputGroup size='sm' marginTop='5px' marginBottom='5px' gap={1} borderRadius='15px'>
      <ColorPickerMenu value={localValue} colors={colors} onChange={handleColorPickerChange} />

      <InputLeftAddon>{LEFT_ADDON_TEXT}</InputLeftAddon>
      <Input
        type='text'
        value={removeColorAddon(localValue)}
        onBlur={() => saveChange(false/*don't focus editor*/)}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
      />
     </InputGroup>
    </ToolContainer>
  );
};
