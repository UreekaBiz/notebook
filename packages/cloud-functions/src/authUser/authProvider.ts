import { UserRecord } from 'firebase-admin/auth';

import { isBlank } from '@ureeka-notebook/service-common';

// ********************************************************************************
type Profile = Readonly<{
  email?: string;
  photoURL? : string;
  displayName?: string;
}>;
// extracts as much profile information as possible from the UserRecord looking at
// any available provider data
export const extractProfile = (user: UserRecord): Profile => {
  // default to the UserRecord itself
  let email = user.email,
      photoURL = user.photoURL,
      displayName = user.displayName;

  // fill in any blanks using the available provider data
  for(const provider of user.providerData) {
    if(isBlank(email)) email = provider.email;
    if(isBlank(photoURL)) photoURL = provider.photoURL;
    if(isBlank(displayName)) displayName = provider.displayName;
  }

  return { email, displayName };
};
