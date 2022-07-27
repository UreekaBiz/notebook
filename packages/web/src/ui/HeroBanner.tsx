import { Box, Flex, Heading, Text } from '@chakra-ui/react';

// ********************************************************************************
export const HeroBanner: React.FC =  () => {
  return (
    <Box width='full' paddingY={60} >
      <Flex direction='column' alignItems='center' marginX='auto' width='full' maxWidth={500} textAlign='center'>
        <Heading>Notebooks. Reimagined.</Heading>
        <Text fontSize={24}>something somethingsomething somethingsomething</Text>
      </Flex>
    </Box>
  );
};
