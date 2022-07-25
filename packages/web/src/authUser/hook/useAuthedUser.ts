import { useContext } from 'react';

import { AuthedUserContext } from '../context/AuthUserContext';

// ****************************************************************************
// hook that returns the current value of the AuthedUserContext
export const useAuthedUser = () => {
  const context = useContext(AuthedUserContext);
  return context;
};
