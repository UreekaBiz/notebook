import { isBlank, UserProfilePublic } from '@ureeka-notebook/web-service';

// ********************************************************************************
/** gets a readable name for the given UserProfilePublic */
export const getDisplayName = (profile: UserProfilePublic) => {
  const name = `${profile.firstName ?? ''} ${profile.lastName ?? ''}`;

  // FIXME: What should we do if the name is blank?
  if(isBlank(name.trim())) return 'Unknown User';

  return name;
};
