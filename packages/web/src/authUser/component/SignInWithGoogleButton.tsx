import { Button, Center, Text } from '@chakra-ui/react';
import { FcGoogle } from 'react-icons/fc';

import { signInWithGooglePopup } from '@ureeka-notebook/web-service';

// ********************************************************************************
export const SignInWithGoogleButton = () => {
  // == Handler ===================================================================
  const handleClick = async () => await signInWithGooglePopup();

  // == UI ========================================================================
  return (
    <Center padding={8}>
      <Button width='full' maxWidth='md' colorScheme='gray' leftIcon={<FcGoogle />} variant='solid' onClick={handleClick}>
        <Center>
          <Text>Sign in with Google</Text>
        </Center>
      </Button>
    </Center>
  );
};
