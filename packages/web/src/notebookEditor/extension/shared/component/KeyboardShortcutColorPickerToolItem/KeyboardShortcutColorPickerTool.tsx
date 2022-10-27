import { Input } from '@chakra-ui/react';
import { ChangeEventHandler, KeyboardEventHandler } from 'react';

import { colorToHexColor, removeColorAddon, keyboardShortcutTextColors, Color } from 'notebookEditor/theme/type';
import { useLocalValue } from 'notebookEditor/shared/hook/useLocalValue';

import { KeyboardShortcutColorPickerMenu } from './KeyboardShortcutColorPickerMenu';
import { InputToolItemContainer } from '../InputToolItemContainer';

// ********************************************************************************
// == Interface ===================================================================
interface Props {
  name: string;

  value: string;
  onChange: (value: string, focus?: boolean) => void;

  colors?: Color[][];
}

// == Component ===================================================================
export const KeyboardShortcutColorPickerTool: React.FC<Props> = ({ colors = keyboardShortcutTextColors, name, onChange, value }) => {
  // -- State ---------------------------------------------------------------------
  const { commitChange, localValue, resetLocalValue, updateLocalValue } = useLocalValue(value, onChange);

  // -- Handler ---------------------------------------------------------------------
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
    // save changes when user presses Enter
    if(event.key === 'Enter') {
      // prevent defaults so that PM does not handle the event
      event.preventDefault();
      event.stopPropagation();

      // save change
      saveChange();
    } /* else -- ignore */
  };

  // -- UI ------------------------------------------------------------------------
  return (
    <InputToolItemContainer
      name={name}
      rightContent={
        <KeyboardShortcutColorPickerMenu value={localValue} colors={colors} onChange={handleColorPickerChange} />
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
