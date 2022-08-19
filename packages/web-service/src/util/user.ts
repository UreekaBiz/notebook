import { UserIdentifier } from '@ureeka-notebook/service-common';

import { auth } from './firebase';

// ********************************************************************************
// NOTE: to prevent the need for cross-service dependencies, the following simply
//       retrieves the logged in UserIdentifier. Be aware that the User can change
//       at any time and that this User may not be the same as the User that other
//       services may be using at the time of this call
export const getUserId = (): UserIdentifier | undefined/*not logged in*/ => {
  const user = auth.currentUser;
  if(!user) return undefined/*not logged in*/;
  return user.uid;
};
