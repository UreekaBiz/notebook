import { Avatar, Button, Menu, MenuButton, MenuDivider, MenuItem, MenuList } from '@chakra-ui/react';
import Link from 'next/link';
import { AiOutlineFileText } from 'react-icons/ai';
import { BiHomeAlt, BiLogOut } from 'react-icons/bi';
import { FiSettings } from 'react-icons/fi';

import { isLoggedOut } from '@ureeka-notebook/web-service';

import { useAuthedUser } from 'authUser/hook/useAuthedUser';
import { useRouter } from 'next/router';
import { coreRoutes } from 'shared/routes';
import { getPrivateDisplayName } from 'user/util';

// displays the User's avatar and menu (ala a 'hamburger')
// NOTE: the AuthUserService doesn't need to be initialized to use this component.
//       While the service is being initialized this component won't be shown.
// ********************************************************************************
interface Props {
  /** show a login button when the User is not auth'ed. Defaults to true */
  showLogIn?: boolean;

  // FIXME: get the options from chakra
  /** the size of the avatar */
  avatarSize?: 'sm' | 'md' | 'lg' | 'xl';
  /** the size of the login button */
  buttonSize?: 'sm' | 'md' | 'lg' | 'xl';
}
export const AuthAvatar: React.FC<Props> = ({ avatarSize, buttonSize, showLogIn = true }) => {
  const authedUser = useAuthedUser();

  const router = useRouter();

  // == Handlers ==================================================================
  const handleHomeClick = () => router.push(coreRoutes.root);
  const handleNotebooksClick = () => router.push(coreRoutes.notebook);

  const handleSettingsClick = () => router.push(coreRoutes.settings);
  const handleSignOutClick = () => router.push(coreRoutes.logout);

  // == UI ========================================================================
  if(authedUser === undefined/*AuthUserService not initialized*/) return null/*don't render anything*/;

  if(isLoggedOut(authedUser)) {
    if(!showLogIn) return null/*don't render anything*/;
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
      <MenuButton
        as={Avatar}
        name={getPrivateDisplayName(authedUser.profilePrivate)}
        src={authedUser.profilePrivate.profileImageUrl}
        size={avatarSize}
        marginLeft={4}
        _hover={{ cursor: 'pointer' }}
      />
      {/* FIXME: make that it so that options can be a prop from the component?*/}
      <MenuList>
        <MenuItem icon={<BiHomeAlt />} onClick={handleHomeClick}>Home</MenuItem>
        <MenuItem icon={<AiOutlineFileText />} onClick={handleNotebooksClick}>Notebooks</MenuItem>

        <MenuDivider />
        <MenuItem icon={<FiSettings />} onClick={handleSettingsClick}>Settings</MenuItem>
        <MenuItem icon={<BiLogOut />} onClick={handleSignOutClick}>Sign out</MenuItem>
      </MenuList>
    </Menu>
  );
};
