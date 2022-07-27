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
    <Select value={value} onChange={handleChange} flexBasis='30%' placeholder='Unit' size='sm' width={75}>
      {Units.map(unit => (<option key={unit} value={unit}>{unit.toString().toUpperCase()}</option>))}
    </Select>
  );
};
