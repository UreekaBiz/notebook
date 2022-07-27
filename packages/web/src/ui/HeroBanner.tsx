import { Box, Flex, Heading, Text } from '@chakra-ui/react';

// ********************************************************************************
export const HeroBanner: React.FC =  () => {
  return (
    <Box width='full' height='100vh' paddingTop={250}>
      <Flex direction='column' alignItems='center' marginX='auto' width='full' maxWidth={900} textAlign='center'>
        <Heading fontSize={72} marginBottom={2}>Notebooks. Reimagined.</Heading>
        <Text fontSize={32}>something somethingsomething somethingsomething</Text>
      </Flex>
    </Box>
  );
};
