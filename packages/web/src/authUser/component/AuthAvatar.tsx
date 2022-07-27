import { Avatar, Button, Menu, MenuButton, MenuItem, MenuList } from '@chakra-ui/react';
import Link from 'next/link';
import { BiLogOut } from 'react-icons/bi';
import { FiSettings } from 'react-icons/fi';

import { isLoggedOut } from '@ureeka-notebook/web-service';

import { useAuthedUser } from 'authUser/hook/useAuthedUser';
import { coreRoutes } from 'shared/routes';
import { useRouter } from 'next/router';

// ********************************************************************************
interface Props {
  /** show a log in button when the user is not auth'ed. Defaults to true*/
  showLogIn?: boolean;

  // FIXME: get the options from chakra
  /** the size of the avatar*/
  avatarSize?: 'sm' | 'md' | 'lg' | 'xl';
  /** the size of the login button */
  buttonSize?: 'sm' | 'md' | 'lg' | 'xl';
}
/**
 * Component that displays the user's avatar. This avatar functions as a Menu since
 * it will display a list of options when the user clicks on it. If enabled, a
 * button to log in will be displayed if the user is not auth'ed.
 */
// NOTE: This component don't require the AuthUser Service to be initialized to
//       work, while the service is being initialized this component won't be shown.
export const AuthAvatar: React.FC<Props> = ({ avatarSize, buttonSize, showLogIn = true }) => {
  const authedUser = useAuthedUser();

  const router = useRouter();

  // == Handlers ==================================================================
  const handleSettingsClick = () => {
    router.push(coreRoutes.settings);
  };

  const handleSignOutClick = () => {
    router.push(coreRoutes.logout);
  };

  // == UI ========================================================================
  if(authedUser === undefined/*AuthUserService not initialized*/) return null/*don't render anything*/;

  if(isLoggedOut(authedUser)){
    if(!showLogIn) return null/*don't render anything*/;
    return (
      <Link href={coreRoutes.login}>
        <Button colorScheme='blue' size={buttonSize}>
            Login
        </Button>
      </Link>
    );

  } // else -- user is auth'ed

  return (
    <Menu computePositionOnMount/**prevents sideways overflow in parent container */>
      {authedUser ?
        <MenuButton
          as={Avatar}
          name={`${authedUser.profilePrivate.firstName ?? ''/*default*/} ${authedUser.profilePrivate.lastName ?? ''/*default*/}`}
          src={authedUser.profilePrivate.profileImageUrl}
          size={avatarSize}
          marginLeft={4}
          _hover={{ cursor: 'pointer' }}
        /> : null}
      <MenuList>
        {/* FIXME: Make that it so that options can be a prop from the component?*/}
        <MenuItem icon={<FiSettings />} onClick={handleSettingsClick}>
          Settings
        </MenuItem>
        <MenuItem icon={<BiLogOut />} onClick={handleSignOutClick}>
          Sign out
        </MenuItem>
      </MenuList>
    </Menu>
  );
};
