import { useContext } from 'react';

import { AuthedUserContext } from 'authUser/context/AuthUserContext';
import { ApplicationError } from '@ureeka-notebook/web-service';

// ********************************************************************************
// Hook that subscribes to the AuthUserContext and only provides a value when the
// user is auth'ed. If the user is not auth'ed, an error will be thrown. This hook
// is meant to be used inside a RequiredAuthUserWrapper to ensure that the user is
// auth'ed before rendering the component.
export const useValidatedAuthedUser = () => {
  const context = useContext(AuthedUserContext);
  if(!context || !context.authedUser) { throw new ApplicationError('devel/config', 'Trying to use useValidatedAuthedUser but user is not authed.'); }

  return context;
};

