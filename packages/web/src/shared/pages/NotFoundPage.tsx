import { Box, Button, Flex, Heading, Text } from '@chakra-ui/react';
import { useRouter } from 'next/router';

import { coreRoutes } from 'shared/routes';

// ********************************************************************************
interface Props { message?: string; }
export const NotFoundPage: React.FC<Props> = ({ message }) => {
  // == Handlers ==================================================================
  const router = useRouter();
  const handleButtonClick = () => router.push(coreRoutes.root);

  // == UI ========================================================================
  return (
    <Flex flexDirection='column' justifyContent='center' alignItems='center'  width='100wh' height='105vh' backgroundColor='gray.200' >
      <Box paddingY={10} paddingX={6} textAlign='center'>
          {/* WIP: Commented while removing chakra-ui/icons <WarningTwoIcon boxSize='50px' color='red' /> */}
          <Heading as='h2' size='xl' marginTop={6} marginBottom={2}>404</Heading>
        <Text color='gray.500'>{message ? message : 'The Requested URL was not found on this server'}</Text>
        <Button marginTop={5} onClick={handleButtonClick}>Go back to main page</Button>
      </Box>
    </Flex>
  );
};
