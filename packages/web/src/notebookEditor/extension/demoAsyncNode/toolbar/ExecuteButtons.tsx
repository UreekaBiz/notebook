import { Box, Flex } from '@chakra-ui/react';

import { EditorToolComponentProps } from 'notebookEditor/toolbar/type';

import { ExecuteLocalDemoAsyncNodeButton } from './ExecuteLocalDemoAsyncNodeButton';
import { ExecuteRemoteDemoAsyncNodeButton } from './ExecuteRemoteDemoAsyncNodeButton';

// ********************************************************************************
interface Props extends EditorToolComponentProps {/*no additional*/ }
export const ExecuteButtons: React.FC<Props> = (props) => {
  return (
    <Flex>
      <Box marginRight={1} >
        <ExecuteRemoteDemoAsyncNodeButton {...props} />
      </Box>
      <ExecuteLocalDemoAsyncNodeButton {...props} />
    </Flex>
  );
};
