import { Box, Divider, Text } from '@chakra-ui/react';

import { useValidatedEditor } from 'notebookEditor/hook/useValidatedEditor';

// ********************************************************************************
export const Debugger = () => {
  const editor = useValidatedEditor();
  return (
    <>
      <Divider/>
      <Box flex='1 1 0' paddingX={2} overflow='auto'>
        <Text marginBottom={1} paddingTop={2} fontSize={15} fontWeight='bold' textTransform='capitalize'>
          Selection
        </Text>
        <Box overflow='auto' fontSize={12}>
          <pre>{JSON.stringify(editor.state.selection, null/*no replacer*/, 2)}</pre>
        </Box>
      </Box>

      <Divider/>
      <Box flex='1 1 0' paddingX={2} overflow='auto'>
        <Text marginBottom={1} paddingTop={2} fontSize={15} fontWeight='bold' textTransform='capitalize'>
          Document
        </Text>
        <Box overflow='auto' fontSize={12}>
          <pre>{JSON.stringify(editor.state.doc, null/*no replacer*/, 2)}</pre>
        </Box>
      </Box>
    </>
  );
};
