import { Box, Text, VStack } from '@chakra-ui/react';
import { useRouter } from 'next/router';

import { settingsRoutes } from 'shared/routes';

// ********************************************************************************
// == Items =======================================================================
type NavigationItem = Readonly<{
  title: string;
  description: string;

  /**
   * path to redirect the user when the item is clicked
   * SEE: settingsRoutes.ts
   */
  path: string;
}>;

const navigationItems: ReadonlyArray<NavigationItem> = [
  {
    title: 'General Information',
    description: 'Change your general information',

    path: settingsRoutes.root,
  },
  {
    title: 'API Keys',
    description: 'Change your API keys',

    path: settingsRoutes.apiKey,
  },
];

// == Component ===================================================================
export const SettingsNavigation: React.FC = () => {
  const router = useRouter();
  const handleItemClick = (item: NavigationItem) => {
    router.push(item.path);
  };

  return (
    <Box>
      <VStack spacing={8} alignItems='flex-start' paddingLeft={4} borderLeft='1px solid #EAEAEA'>
        {navigationItems.map((item, i) => (
          <Box key={i} _hover={{ cursor: 'pointer' }} onClick={() => handleItemClick(item)}>
            <Text fontSize='lg' fontWeight='bold'>{item.title}</Text>
            <Text>{item.description}</Text>
          </Box>
        ))};
      </VStack>
    </Box>
  );
};
