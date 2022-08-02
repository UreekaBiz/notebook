import { isBlank, UserProfilePublic } from '@ureeka-notebook/web-service';

// ********************************************************************************
// a display name for the given User Profile
export const getDisplayName = (profile: UserProfilePublic) => {
  const blankFirst = isBlank(profile.firstName),
        blankLast = isBlank(profile.lastName);
  if(blankFirst && blankLast) return 'Anonymous User'/*FIXME: constant*/;
  if(blankFirst) return profile.lastName!;
  if(blankLast) return profile.firstName!;
  return `${profile.firstName} ${profile.lastName}`;
};

export const getInitials = (profile: UserProfilePublic) => {
  const blankFirst = isBlank(profile.firstName),
        blankLast = isBlank(profile.lastName);
  if(blankFirst && blankLast) return 'A'/*FIXME: constant*/;
  if(blankFirst) return profile.lastName!.charAt(0);
  if(blankLast) return profile.firstName!.charAt(0);
  return `${profile.firstName!.charAt(0)}${profile.lastName!.charAt(0)}`;
};
