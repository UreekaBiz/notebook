import { Box } from '@chakra-ui/react';
import { ReactNode } from 'react';

// ********************************************************************************
interface Props { children: ReactNode; }
export const FullPageLayout: React.FC<Props> = ({ children }) => (
  <Box position='relative' width='100vw' height='100vh' overflowX='auto' overflowY='auto'>
    {children}
  </Box>
);
