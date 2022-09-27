import { Input } from '@chakra-ui/react';
import { ChangeEventHandler, KeyboardEventHandler } from 'react';

import { TOOL_ITEM_DATA_TYPE } from 'notebookEditor/sidebar/toolbar/type';

import { CodeBlockReferenceDelimiterToolItemProps } from './CodeBlockReferenceDelimiterToolItem';

// ********************************************************************************
export const DelimiterToolItem: React.FC<CodeBlockReferenceDelimiterToolItemProps> = ({ localValue, inputPlaceholder, commitChange, resetLocalValue, updateLocalValue }) => {
// == Handler ===================================================================
  const saveLocalValueChange = (focus: boolean = true) => {
    if(localValue) commitChange(undefined/*use stored value*/, focus);
    else resetLocalValue();
  };

  const handleLocalValueChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    const newValue = event.target.value;
    updateLocalValue(`${newValue}`);
  };

  const handleKeyDown: KeyboardEventHandler<HTMLInputElement> = (event) => {
    // save changes when user presses Enter
    if(event.key === 'Enter') {
      saveLocalValueChange();
    } /* else -- ignore */
  };

  // == UI ========================================================================
  return (
    <Input
      value={localValue}
      size='sm'
      autoComplete='off'
      marginBottom='5px'
      placeholder={inputPlaceholder}
      datatype={TOOL_ITEM_DATA_TYPE/*(SEE: notebookEditor/toolbar/type )*/}
      onBlur={() => saveLocalValueChange(false)}
      onChange={handleLocalValueChange}
      onKeyDown={handleKeyDown}
    />
  );
};
