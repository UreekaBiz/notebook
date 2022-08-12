import { Box, Flex } from '@chakra-ui/react';

import { EditorToolComponentProps } from 'notebookEditor/toolbar/type';

import { ExecuteDemo2AsyncNodeButton } from './ExecuteDemo2AsyncNodeButton';
import { ExecuteServerSideDemo2AsyncNodeButton } from './ExecuteServerSideDemo2AsyncNodeButton';

// ********************************************************************************
interface Props extends EditorToolComponentProps {/*no additional*/ }
export const ExecuteButtons: React.FC<Props> = (props) => {
  return (
    <Flex>
      <Box marginRight={1} >
        <ExecuteServerSideDemo2AsyncNodeButton {...props} />
      </Box>
      <ExecuteDemo2AsyncNodeButton {...props} />
    </Flex>
  );
};
