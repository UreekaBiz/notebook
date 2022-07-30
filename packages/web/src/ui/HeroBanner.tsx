import { Box, Flex, Heading, Text } from '@chakra-ui/react';

// ********************************************************************************
export const HeroBanner: React.FC =  () => {
  return (
    <Box width='full' paddingTop={100} paddingBottom={100} backgroundColor='#E2E8F0'>
      <Box marginX='auto' width='full' maxWidth={1000}>
        <Flex marginX='auto' textAlign='center' direction='column' alignItems='flex-start' maxWidth={800}>
          <Heading fontSize={72} marginBottom={2}>Notebooks. Reimagined.</Heading>
          <Text fontSize={32}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod.
          </Text>
        </Flex>
      </Box>
    </Box>
  );
};
