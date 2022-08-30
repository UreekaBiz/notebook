import { Box, Flex } from '@chakra-ui/react';
import { ReactNode } from 'react';

import { SettingsNavigation } from './SettingsNavigation';

// ********************************************************************************
// Layout component that is meant to be used as a wrapper on all of the setting
// pages.
interface Props {
  children: ReactNode;
}
export const SettingsLayoutWrapper: React.FC<Props> = ({ children }: Props) =>
  <Flex>
    <Box flex='1 1'/*take all remaining space*/ marginRight={24}>{children}</Box>
    <Box width={200}>
      <SettingsNavigation />
    </Box>
  </Flex>;

