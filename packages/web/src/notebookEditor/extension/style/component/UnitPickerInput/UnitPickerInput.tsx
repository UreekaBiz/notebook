import { Box, Flex, Input } from '@chakra-ui/react';
import { ChangeEventHandler, KeyboardEventHandler } from 'react';

import { useLocalValue } from 'notebookEditor/shared/hook/useLocalValue';
import { separateUnitFromString, Unit } from 'notebookEditor/theme/type';

import { UnitPicker } from './UnitPicker';

// ********************************************************************************
interface Props {
  name: string;
  valueWithUnit: string;
  onChange: (valueWithUnit: string) => void;
}
export const UnitPickerInput: React.FC<Props> = ({ name, onChange, valueWithUnit }) => {
  const { commitChange, localValue, resetLocalValue, updateLocalValue } = useLocalValue(valueWithUnit, onChange);
  let [value, unit] = separateUnitFromString(localValue);
  unit ??= Unit.Pixel/*default value*/;

  // == Handlers ==================================================================
  const handleValueChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    const newValue = event.target.value;
    updateLocalValue(`${newValue}${unit}`);
  };

  const handleUnitChange = (newUnit: Unit) => {
    const newValue = `${value}${newUnit}`;
    updateLocalValue(newValue);

    // Sync with parent when selecting from dropdown
    if(value && unit) commitChange(newValue);
  };

  const saveChange = () => {
    if(value && unit) commitChange();
    else resetLocalValue();
  };

  const handleKeyDown: KeyboardEventHandler<HTMLInputElement> = (event) => {
    // Save changes when user presses enter
    if(event.key === 'Enter') saveChange();
  };

  // == UI ========================================================================
  return (
    <Box>
      {name}
      <Flex marginTop='5px'>
        <Input onBlur={saveChange} onChange={handleValueChange} onKeyDown={handleKeyDown} value={value} type='number' flexBasis='70%' size='sm' width={150} />
        <UnitPicker value={unit} onChange={handleUnitChange} />
      </Flex>
    </Box>
  );
};
