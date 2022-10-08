import { Input } from '@chakra-ui/react';
import { ChangeEventHandler, KeyboardEventHandler } from 'react';

import { useLocalValue } from 'notebookEditor/shared/hook/useLocalValue';
import { separateUnitFromString, Unit } from 'notebookEditor/theme/type';

import { InputToolItemContainer } from '../InputToolItemContainer';
import { UnitPicker } from './UnitPicker';

// ********************************************************************************
interface Props {
  name: string;
  value: string;

  minValue?: number;
  maxValue?: number;

  onChange: (value: string, focus?: boolean) => void;
}
export const InputWithUnitTool: React.FC<Props> = ({ value: initialValue, name, minValue = 0, maxValue = Number.MAX_SAFE_INTEGER, onChange }) => {
  const { commitChange, localValue, resetLocalValue, updateLocalValue } = useLocalValue(initialValue, onChange);
  let [value, unit] = separateUnitFromString(localValue);
  unit ??= Unit.Pixel/*default value*/;

  // == Handler ===================================================================
  const handleValueChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    const newValue = event.target.value;
    updateLocalValue(`${newValue}${unit}`);
  };

  const handleUnitChange = (newUnit: Unit) => {
    const newValue = `${value}${newUnit}`;
    updateLocalValue(newValue);

    // Sync with parent when selecting from dropdown
    if(value && unit) commitChange(newValue, true/*focus editor*/);
  };

  const saveChange = (focus: boolean = true/*focus editor by default*/) => {
    if(value && unit) {
      // gets the value in range before committing
      const valueInRange = Math.max(minValue ?? 0, Math.min(maxValue, Number(value)));
      const newValue = `${valueInRange}${unit}`;
      // sync with local value and commit the change.
      updateLocalValue(newValue);
      commitChange(newValue, focus);
    }
    else resetLocalValue();
  };

  const handleKeyDown: KeyboardEventHandler<HTMLInputElement> = (event) => {
    if(event.key === 'Enter') {
      // prevent PM from handling the event
      event.preventDefault();
      event.stopPropagation();
      saveChange(true/*focus editor*/);
    } /* else -- ignore */
  };

  // == UI ========================================================================
  return (
    <InputToolItemContainer
      name={name}
      rightContent={<UnitPicker value={unit} onChange={handleUnitChange} />}
    >
      <Input
        type='number'
        value={value}
        min={minValue}
        max={maxValue}
        size='sm'
        onBlur={() => saveChange(false/*don't focus editor*/)}
        onChange={handleValueChange}
        onKeyDown={handleKeyDown}
      />
    </InputToolItemContainer>
  );
};
