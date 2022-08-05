import { FlexProps, Select } from '@chakra-ui/react';
import { ChangeEventHandler } from 'react';

import { ToolContainer } from 'notebookEditor/toolbar/ToolbarContainer';
import { TOOL_ITEM_DATA_TYPE } from 'notebookEditor/toolbar/type';

// ********************************************************************************
type Props = {
  name: string;
  value: string;
  options: string[];

  onChange: (value: string) => void;
} & FlexProps;
export const DropdownTool: React.FC<Props> = ({ name, width, marginTop, value, options, onChange }) => {

  const handleChange: ChangeEventHandler<HTMLSelectElement> = (event) => {
      onChange(event.target.value);
  };

  return (
    <ToolContainer name={name} width={width} marginTop={marginTop}>
      <Select value={value} marginTop='2px' datatype={TOOL_ITEM_DATA_TYPE/*(SEE: notebookEditor/toolbar/type )*/} onChange={handleChange}>
        {options.map((option, optionIndex) => <option key={optionIndex}>{option}</option>)}
      </Select>
    </ToolContainer>
  );
};
