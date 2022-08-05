import { Checkbox } from '@chakra-ui/react';

import { ToolContainer } from 'notebookEditor/toolbar/ToolbarContainer';
import { TOOL_ITEM_DATA_TYPE } from 'notebookEditor/toolbar/type';

// ********************************************************************************
interface Props {
  name: string;
  width: string;
  marginTop: string;
  value: boolean;
  onChange: () => void;
  checkName: string;
}
export const CheckboxTool: React.FC<Props> = ({ name, width, marginTop, value, onChange, checkName }) =>
  <ToolContainer name={name} width={width} marginTop={marginTop}>
    <Checkbox isChecked={value} marginTop='10px' marginLeft='10px' datatype={TOOL_ITEM_DATA_TYPE/*(SEE: notebookEditor/toolbar/type )*/} onChange={onChange}>
      {checkName}
    </Checkbox>
  </ToolContainer>;
