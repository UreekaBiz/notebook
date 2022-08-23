import { Select } from '@chakra-ui/react';
import { ChangeEventHandler } from 'react';

import { TOOL_ITEM_DATA_TYPE } from 'notebookEditor/toolbar/type';

// ********************************************************************************
export type DropdownToolItemType = { value: string; label: string; };
type Props = {
  name: string;
  value: string;
  options: DropdownToolItemType[];

  onChange: (value: string) => void;
}
export const DropdownTool: React.FC<Props> = ({ name, value, options, onChange }) => {

  const handleChange: ChangeEventHandler<HTMLSelectElement> = (event) => {
    onChange(event.target.value);
  };

  return (
    <Select size='sm' value={value} marginY={1} datatype={TOOL_ITEM_DATA_TYPE/*(SEE: journalEditor/toolbar/type )*/} onChange={handleChange}>
      <option value='' disabled>Select</option>
      {options.map((option, optionIndex) => <option value={option.value} key={optionIndex}>{option.label}</option>)}
    </Select>
  );
};
