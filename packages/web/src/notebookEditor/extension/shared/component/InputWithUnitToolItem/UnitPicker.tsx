import { Select } from '@chakra-ui/react';
import { ChangeEventHandler } from 'react';

import { Unit, Units } from 'notebookEditor/theme/type';

// ********************************************************************************
interface Props {
  value: Unit | undefined/*value not set, potential initial value or invalid state, default used (px)*/;
  onChange: (unit: Unit) => void;
}
export const UnitPicker: React.FC<Props> = ({ value = Unit.Pixel, onChange }) => {
  const handleChange: ChangeEventHandler<HTMLSelectElement> = (event) => {
    const value = event.target.value as Unit/*by definition*/;
    onChange(value);
  };

  return (
    <Select
      // NOTE: Using class name to override the (seemingly impossible!) styles for
      //       the input with the accessible props.
      className='unit-picker'
      value={value}
      placeholder='Unit'
      size='sm'
      onChange={handleChange}
    >
      {Units.map(unit => (<option key={unit} value={unit}>{unit.toString().toUpperCase()}</option>))}
    </Select>
  );
};
