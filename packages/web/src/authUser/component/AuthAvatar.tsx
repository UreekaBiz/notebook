import { Box, Button, Flex, Link, Menu, MenuButton, MenuDivider, MenuItem, MenuList } from '@chakra-ui/react';
import NextLink from 'next/link';
import { BiHomeAlt, BiLogOut } from 'react-icons/bi';
import { CgFileDocument } from 'react-icons/cg';
import { FaHashtag } from 'react-icons/fa';
import { HiOutlineViewGrid } from 'react-icons/hi';
import { TbSettings } from 'react-icons/tb';

import { getEnvBoolean, getPackageVersion, isLoggedOut, Package } from '@ureeka-notebook/web-service';

import { useAuthedUser } from 'authUser/hook/useAuthedUser';
import { coreRoutes, profileRoutes } from 'shared/routes';
import { UserProfileAvatar } from 'user/component/UserProfileAvatar';
import { getPrivateDisplayName } from 'user/util';

// displays the User's avatar and menu (ala a 'hamburger')
// NOTE: the AuthUserService doesn't need to be initialized to use this component.
//       While the service is being initialized this component won't be shown.
// ********************************************************************************
// should a login button be shown if configured to do so? This allows the config to
// override and prevent the login button from being shown.
const shouldShowLogin = getEnvBoolean('NEXT_PUBLIC_LOGIN_SHOW_BUTTON', true/*default 'show' (by contract)*/);

// ********************************************************************************
interface Props {
  /** show a login button when the User is not auth'ed. Defaults to true */
  showLogIn?: boolean;

  // FIXME: get the options from chakra
  /** the size of the login button */
  buttonSize?: 'sm' | 'md' | 'lg' | 'xl';
}
export const AuthAvatar: React.FC<Props> = ({ buttonSize, showLogIn = true }) => {
  const authedUser = useAuthedUser();

  const version = getPackageVersion(),
        versionNumber = version.packages[Package.Web],
        versionDate = version.date ? new Date(version.date).toLocaleDateString() : 'unknown';

  // == UI ========================================================================
  if(authedUser === undefined/*AuthUserService not initialized*/) return null/*don't render anything*/;

  if(isLoggedOut(authedUser)) {
    if(!shouldShowLogin || !showLogIn) return null/*don't render anything (config takes precedence over prop)*/;
    return (
      <Link href={coreRoutes.login}>
        <Button colorScheme='blue' size={buttonSize}>
          Login
        </Button>
      </Link>
    );
  } /* else -- User is auth'ed */

  // ..............................................................................
  return (
    <Menu computePositionOnMount/**prevents sideways overflow in parent container */>
      <MenuButton name={getPrivateDisplayName(authedUser.profilePrivate)}>
        <UserProfileAvatar
          userId={authedUser.authedUser.userId}
          userPrivateProfile={authedUser.profilePrivate}
          size='sm'
          width='32px'
          height='32px'
          borderRadius='32px'
          _hover={{ cursor: 'pointer' }}
        />
      </MenuButton>
      {/* FIXME: make that it so that options can be a prop from the component? */}
      <MenuList>
        <NextLink href={coreRoutes.root} passHref>
          <MenuItem as={Link} icon={<BiHomeAlt />} textDecoration='none !important'/*overrides default*/>
              Home
          </MenuItem>
        </NextLink>

        <NextLink href={profileRoutes.notebooks} passHref>
          <MenuItem as={Link} icon={<CgFileDocument />} textDecoration='none !important'/*overrides default*/>
            Notebooks
          </MenuItem>
        </NextLink>

        <NextLink href={profileRoutes.collections} passHref>
          <MenuItem as={Link} icon={<HiOutlineViewGrid />} textDecoration='none !important'/*overrides default*/>
            Collections
          </MenuItem>
        </NextLink>

        <NextLink href={profileRoutes.hashtags} passHref>
          <MenuItem as={Link} icon={<FaHashtag />} textDecoration='none !important'/*overrides default*/>
            Hashtags
          </MenuItem>
        </NextLink>

        <MenuDivider />

        <NextLink href={coreRoutes.settings} passHref>
          <MenuItem as={Link} icon={<TbSettings />} textDecoration='none !important'/*overrides default*/>
            Settings
          </MenuItem>
        </NextLink>

        <NextLink href={coreRoutes.logout} passHref>
          <MenuItem as={Link}  icon={<BiLogOut />} textDecoration='none !important'/*overrides default*/>
            Sign out
          </MenuItem>
        </NextLink>

        <MenuDivider />

        <Flex
          alignItems='center'
          justifyContent='space-between'
          paddingX={2}
          color='#777'
          fontSize='9px'
          fontWeight='600'
        >
          <Box>
            Version: {versionNumber ?? '(local)'}
          </Box>
          <Box>
            {versionDate}
          </Box>
        </Flex>
      </MenuList>
    </Menu>
  );
};
