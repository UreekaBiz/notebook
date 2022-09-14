import { Button, Menu, MenuButton, MenuDivider, MenuItem, MenuList } from '@chakra-ui/react';
import Link from 'next/link';
import { AiOutlineFileText } from 'react-icons/ai';
import { BiHomeAlt, BiLogOut } from 'react-icons/bi';
import { FiSettings } from 'react-icons/fi';

import { getEnvBoolean, getPackageVersion, isLoggedOut, Package } from '@ureeka-notebook/web-service';

import { useAuthedUser } from 'authUser/hook/useAuthedUser';
import { useRouter } from 'next/router';
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

  const router = useRouter();

  const version = getPackageVersion(),
        versionNumber = version.packages[Package.Web],
        versionDate = version.date ? new Date(version.date).toLocaleDateString() : 'unknown';

  // == Handler ===================================================================
  const handleHomeClick = () => router.push(coreRoutes.root);
  const handleNotebooksClick = () => router.push(profileRoutes.notebooks);

  const handleSettingsClick = () => router.push(coreRoutes.settings);
  const handleSignOutClick = () => router.push(coreRoutes.logout);

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
        <MenuItem icon={<BiHomeAlt />} onClick={handleHomeClick}>Home</MenuItem>
        <MenuItem icon={<AiOutlineFileText />} onClick={handleNotebooksClick}>Notebooks</MenuItem>

        <MenuDivider />
        <MenuItem icon={<FiSettings />} onClick={handleSettingsClick}>Settings</MenuItem>
        <MenuItem icon={<BiLogOut />} onClick={handleSignOutClick}>Sign out</MenuItem>

        <MenuDivider />
        <MenuItem
          disabled
          paddingY={0}
          color='#666'
          fontSize='12px'
          fontWeight='600'
        >
          Version: {versionNumber ?? '(local)'}
        </MenuItem>
        <MenuItem
          disabled
          paddingY={0}
          color='#666'
          fontSize='12px'
          fontWeight='600'
        >
          {versionDate}
        </MenuItem>
      </MenuList>
    </Menu>
  );
};
