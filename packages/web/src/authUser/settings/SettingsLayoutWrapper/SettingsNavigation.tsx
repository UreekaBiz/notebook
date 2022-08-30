import { Box, Link, Text, VStack } from '@chakra-ui/react';
import NextLink from 'next/link';
import { useRouter } from 'next/router';

import { settingsRoutes } from 'shared/routes';

// ********************************************************************************
// == Type ========================================================================
type NavigationItem = Readonly<{
  title: string;
  description: string;

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

  return (
    <Box>
      <VStack spacing={8} alignItems='flex-start' paddingLeft={4} borderLeft='1px solid #EAEAEA'>
        {navigationItems.map(({ description, path, title }, i) => {
          const isActive = router.pathname === path;

          return (
            <NextLink key={path} href={path} passHref >
              <Link
                color={isActive ? '#3B5FC0' : '#555'}
                textDecoration='none'
                _hover={{ cursor: 'pointer' }}
              >
                <Text fontSize='lg' fontWeight='bold'>{title}</Text>
                <Text>{description}</Text>
              </Link>
            </NextLink>
          );
        })}
      </VStack>
    </Box>
  );
};
