import { Input, InputProps } from '@chakra-ui/react';
import { ChangeEventHandler, KeyboardEventHandler } from 'react';

import { useLocalValue } from 'notebookEditor/shared/hook/useLocalValue';
import { TOOL_ITEM_DATA_TYPE } from 'notebookEditor/sidebar/toolbar/type';

// ********************************************************************************
type Props = Omit<InputProps, 'onChange'> & {
  value: string;

  placeholder: string;

  onChange: (value: string) => void;
}
export const InputTool: React.FC<Props> = ({ value: initialInputValue, placeholder, onChange, ...props }) => {
  const { commitChange, localValue, updateLocalValue } = useLocalValue<string>(initialInputValue, onChange);

  // == Handler ===================================================================
  const handleValueChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    const newValue = event.target.value;
    updateLocalValue(newValue);
  };

  const saveChange = (focus: boolean = true) => {
    commitChange(undefined/*use stored value*/, focus);
  };

  const handleKeyDown: KeyboardEventHandler<HTMLInputElement> = (event) => {
    // save changes when user presses Enter
    if(event.key === 'Enter') {
      saveChange();
    } /* else -- ignore */
  };

  // == UI ========================================================================
  return (
    <Input
      value={localValue}
      placeholder={placeholder}
      size='sm'
      autoComplete='off'
      datatype={TOOL_ITEM_DATA_TYPE/*(SEE: notebookEditor/toolbar/type )*/}
      onBlur={() => saveChange(false)}
      onChange={handleValueChange}
      onKeyDown={handleKeyDown}
      {...props}
    />
  );
};
