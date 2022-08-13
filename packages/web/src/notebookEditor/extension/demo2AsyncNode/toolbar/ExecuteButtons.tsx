import { Box, Flex } from '@chakra-ui/react';

import { EditorToolComponentProps } from 'notebookEditor/toolbar/type';

import { ExecuteLocalDemo2AsyncNodeButton } from './ExecuteLocalDemo2AsyncNodeButton';
import { ExecuteRemoteDemo2AsyncNodeButton } from './ExecuteRemoteDemo2AsyncNodeButton';

// ********************************************************************************
interface Props extends EditorToolComponentProps {/*no additional*/ }
export const ExecuteButtons: React.FC<Props> = (props) => {
  return (
    <Flex>
      <Box marginRight={1} >
        <ExecuteRemoteDemo2AsyncNodeButton {...props} />
      </Box>
      <ExecuteLocalDemo2AsyncNodeButton {...props} />
    </Flex>
  );
};
