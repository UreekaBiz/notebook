import { Box, Link, Flex, Text } from '@chakra-ui/react';
import NextLink from 'next/link';
import { ReactElement } from 'react';
import { BiHome } from 'react-icons/bi';
import { CgFileDocument } from 'react-icons/cg';
import { FaHashtag } from 'react-icons/fa';
import { HiOutlineViewGrid } from 'react-icons/hi';
import { TbSettings } from 'react-icons/tb';

import { useValidatedAuthedUser } from 'authUser/hook/useValidatedAuthedUser';
import { useRouter } from 'next/router';
import { profileRoutes, settingsRoutes } from 'shared/routes';
import { UserProfileAvatar } from 'user/component/UserProfileAvatar';
import { getPrivateDisplayName } from 'user/util';

// ********************************************************************************
// NOTE: this component requires the use of RequiredAuthUserWrapper to work properly.
// == Type ========================================================================
type Tab = {
  label: string;
  path: string;
  icon: ReactElement;
};

const tabs: Tab[] = [
  {
    label: 'Home',
    path: profileRoutes.root,
    icon: <BiHome />,
  },
  {
    label: 'Notebooks',
    path:  profileRoutes.notebooks,
    icon: <CgFileDocument />,
  },
  {
    label: 'Collections',
    path:  profileRoutes.collections,
    icon: <HiOutlineViewGrid />,
  },
  {
    label: 'Hashtags',
    path:  profileRoutes.hashtags,
    icon: <FaHashtag />,
  },
  {
    label: 'Settings',
    path: settingsRoutes.root,
    icon: <TbSettings />,
  },
];

// == Component ===================================================================
export const ProfileNavigation: React.FC = () => {
  const { authedUser: { userId }, profilePrivate } = useValidatedAuthedUser();
  const router = useRouter();

  return (
    <Flex flexDirection='column'>
      <Box marginBottom={6}>
        <UserProfileAvatar
          userId={userId}
          userPrivateProfile={profilePrivate}

          width='100px'
          height='100px'
          marginBottom={3}
        />
        <Text color='#444' fontWeight='600'>{getPrivateDisplayName(profilePrivate)}</Text>
      </Box>
      <Flex flexDirection='column'>
        {tabs.map(({ label, path, icon }) => {
          const isActive = router.pathname === path;
          return (
            <NextLink key={path} href={path} passHref >
              <Link
                display='flex'
                alignItems='center'
                marginBottom={4}
                color={isActive ? '#3B5FC0' : '#555'}
                textDecoration='none'
                _hover={{ cursor: 'pointer' }}
              >
                <Box marginRight={2}>{icon}</Box>
                <Text fontSize={15} fontWeight='500'>{label}</Text>
              </Link>
            </NextLink>
          );
        })}
      </Flex>
    </Flex>
  );
};
