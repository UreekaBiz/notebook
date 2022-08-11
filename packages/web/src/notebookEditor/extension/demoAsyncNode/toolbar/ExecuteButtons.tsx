import { Box, Flex } from '@chakra-ui/react';

import { EditorToolComponentProps } from 'notebookEditor/toolbar/type';

import { ExecuteDemoAsyncNodeButton } from './ExecuteDemoAsyncNodeButton';
import { ExecuteServerSideDemoAsyncNodeButton } from './ExecuteServerSideDemoAsyncNodeButton';

// ********************************************************************************
interface Props extends EditorToolComponentProps {/*no additional*/ }
export const ExecuteButtons: React.FC<Props> = (props) => {
  return (
    <Flex>
      <Box marginRight={1} >
        <ExecuteServerSideDemoAsyncNodeButton {...props} />
      </Box>
      <ExecuteDemoAsyncNodeButton {...props} />
    </Flex>
  );
};
