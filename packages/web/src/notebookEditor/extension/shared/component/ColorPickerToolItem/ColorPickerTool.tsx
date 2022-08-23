import { Input } from '@chakra-ui/react';
import { ChangeEventHandler, KeyboardEventHandler } from 'react';

import { colorToHexColor, removeColorAddon, textColors, Color } from 'notebookEditor/theme/type';
import { useLocalValue } from 'notebookEditor/shared/hook/useLocalValue';

import { ColorPickerMenu } from './ColorPickerMenu';
import { InputToolItemContainer } from '../InputToolItemContainer';

// ********************************************************************************
interface Props {
  name: string;

  value: string;
  onChange: (value: string, focus?: boolean) => void;

  colors?: Color[][];
}
export const ColorPickerTool: React.FC<Props> = ({ colors = textColors, name, onChange, value }) => {
  // == State ====================================================================
  const { commitChange, localValue, resetLocalValue, updateLocalValue } = useLocalValue(value, onChange);

  // == Handler ===================================================================
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
    <InputToolItemContainer
      name={name}
      rightContent={
        <ColorPickerMenu value={localValue} colors={colors} onChange={handleColorPickerChange} />
      }
    >
      <Input
        type='text'
        size='sm'
        value={removeColorAddon(localValue)}
        onBlur={() => saveChange(false/*don't focus editor*/)}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
      />
    </InputToolItemContainer>
  );
};
