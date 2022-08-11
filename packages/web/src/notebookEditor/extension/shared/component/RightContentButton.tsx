import { IconButton } from '@chakra-ui/react';
import { ReactElement } from 'react';

import { TOOL_ITEM_DATA_TYPE } from 'notebookEditor/toolbar/type';

// ********************************************************************************
interface Props {
  isDisabled: boolean;
  icon: ReactElement;
  clickCallback: () => void;
}
export const RightContentButton: React.FC<Props> = ({ isDisabled, icon, clickCallback }) =>
  <IconButton
    marginY='5px'
    marginLeft='10px'
    variant='ghost'
    size='xs'
    datatype={isDisabled ? ''/*none*/ : TOOL_ITEM_DATA_TYPE/*(SEE:notebookEditor/toolbar/type)*/}
    icon={icon}
    isDisabled={isDisabled}
    rounded={100}
    aria-label='executeAsyncNodeButton'
    onClick={clickCallback}
  />;
