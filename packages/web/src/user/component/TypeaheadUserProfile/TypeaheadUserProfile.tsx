import { Box, Input, Menu, MenuButton, MenuItem, MenuList, useToast } from '@chakra-ui/react';
import { useEffect, useRef, useState } from 'react';

import { getLogger, Logger, UserProfileService, UserProfilePublicTuple, UserIdentifier } from '@ureeka-notebook/web-service';

import { useAsyncStatus, useIsMounted } from 'shared/hook';
import { UserProfileListItem } from 'user/component/UserProfileListItem';

const log = getLogger(Logger.USER);

// ********************************************************************************
interface Props {
  ignoreUserIds: Set<UserIdentifier>;
  disabled?: boolean;

  onSelect: (userProfile: UserProfilePublicTuple) => void;
}
export const TypeaheadUserProfile: React.FC<Props> = ({ onSelect, disabled = false, ignoreUserIds }) => {
  // == State =====================================================================
  const [isMenuOpen, setIsMenuOpen] = useState(false/*by contract*/);
  const [inputValue, setInputValue] = useState(''/*empty string as default value*/);
  const [userProfiles, setUserProfiles] = useState<UserProfilePublicTuple[]>([]/*empty array as default value*/);
  const [/*status not needed*/, setStatus] = useAsyncStatus();

  const inputRef = useRef<HTMLInputElement>(null);
  const menuListRef = useRef<HTMLDivElement>(null);

  const toast = useToast();
  const isMounted = useIsMounted();

  const filteredProfiles = userProfiles.filter(({ id }) => !ignoreUserIds.has(id));

  // == Effect ====================================================================
  useEffect(() => {
    // Since the input value could change while the request is being executed due
    // to how the React side effects works a flag must be used to indicate if this
    // is the last value from the input.
    let isCurrentQuery = true;

    // NOTE: A local async function is created since async operations cannot be
    //       performed directly inside a useEffect.
    const searchProfiles = async () => {
      // Remove white space
      const query = inputValue.trim();
      if(query.length < 1) {
        // reset value
        setUserProfiles([]);
        return/*nothing to do*/;
      } /* else -- is a valid query */

      try {
        setStatus('loading');
        const profiles = await UserProfileService.getInstance().typeaheadSearchProfiles(inputValue);

        // query changed while performing async operation
        if(!isCurrentQuery) return/*nothing else to do*/;

        setUserProfiles(profiles);
        setStatus('complete');
      } catch(error) {
        log.error(`Error while searching profiles for query (${query}). Reason:`, error);
        if(!isMounted()) return/*nothing to do*/;

        toast({ title: 'Error', description: 'Error while searching profiles.', status: 'error' });

        if(!isCurrentQuery) return/*nothing else to do*/;
        setStatus('error');
      }
    };

    searchProfiles();

    // the inputValue is no longer the current value
    return () => { isCurrentQuery = false; };
  // NOTE: explicitly set the dependencies to only change when input value change
  //       since it is the only real dependency.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputValue]);

  // == Handler ===================================================================
  const closeMenu = () => setIsMenuOpen(false);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
    setIsMenuOpen(true);
  };
  const handleSelect = (userProfile: UserProfilePublicTuple) => {
    // Reset input value
    setInputValue('');
    closeMenu();
    setStatus('idle');

    onSelect(userProfile);
  };

  // -- Navigation ----------------------------------------------------------------
  // Unfortunately, due to the fact that the input and the menu with the options
  // are different components and not coupled together all the interaction between
  // them must be manually handled. This includes moving with arrows and writing
  // text when the menu is focused.

  // Focus the menu list when user press key down on the input
  const handleInputKeydown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if(event.key === 'Enter') {
      // Get the first item in the list
      const selectedUserProfile = filteredProfiles[0];
      if(!selectedUserProfile) return/*nothing to do*/;

      handleSelect(selectedUserProfile);
    } else if(event.key === 'ArrowDown' && menuListRef.current?.firstChild/*first element*/) {
      const listElement = menuListRef.current.firstChild as HTMLButtonElement;
      listElement.focus();
      listElement.setAttribute('tabindex', '0');
      event.preventDefault();
    } /* else -- FIXME */
  };

  // manually handle focus on input when menu list item is the first element and
  // the arrow key is pressed
  const handleMenuListKeydown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if(!inputRef.current) return/*nothing to do*/;
    const { target, key } = event;

    const index = Number(target.getAttribute('data-index'));
    const prevItem = target.previousElementSibling as HTMLButtonElement | undefined,
          nextItem = target.nextElementSibling as HTMLButtonElement | undefined;

    if(key === 'Enter') {
      // Get the selected list item
      const selectedUserProfile = filteredProfiles[index];
      if(!selectedUserProfile) return/*nothing to do*/;

      handleSelect(selectedUserProfile);
    } else if(key === 'ArrowUp') {
      if(index === 0/*first element*/) inputRef.current.focus();
      else prevItem?.focus();

      event.preventDefault();
      return/*nothing else to do*/;
    } else if(key === 'ArrowDown' && nextItem) {
      nextItem.focus();

      event.preventDefault();
      return/*nothing else to do*/;
    } else if(key.length === 1/*is single character*/) {
      // The input value is updated when the user presses a character.
      setInputValue(inputValue.concat(key));
      inputRef.current.focus();

      event.preventDefault();
      return/*nothing else to do*/;
    } /* else -- FIXME */
  };

  // == UI ========================================================================
  return (
    <Box width='full'>
      <Input ref={inputRef} value={inputValue} disabled={disabled} variant='filled' width='full' marginRight={4} onChange={handleInputChange} onKeyDown={handleInputKeydown} />
      <Menu isOpen={isMenuOpen && filteredProfiles.length > 0} onClose={closeMenu}>
        <MenuButton display='hidden'/>
        <MenuList ref={menuListRef} width='full' onKeyDown={handleMenuListKeydown}>
          {filteredProfiles.map(tuple => (
            <MenuItem key={tuple.id} width={400} onClick={() => handleSelect(tuple)} disabled={disabled}>
              <UserProfileListItem userId={tuple.id} />
            </MenuItem>
          ))}
        </MenuList>
      </Menu>
    </Box>
  );

};
