import { isBlank, stringHashCode, UserProfilePublic } from '@ureeka-notebook/web-service';

// ********************************************************************************
// == Display name ================================================================
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

// ================================================================================
/** A collection of colors used as a background colors */
const DEFAULT_IMAGE_BACKGROUND_COLORS = [
  '#F9EBC8',
  '#FEFBE7',
  '#DAE5D0',
  '#A0BCC2',
];

// Gets a background color from the given userId. This implementation ensures that
// the returned value is consistent for a given userId.
export const getBackgroundImageColor = (userId: string) => {
  const hash = stringHashCode(userId);
  const index = hash % DEFAULT_IMAGE_BACKGROUND_COLORS.length;

  return DEFAULT_IMAGE_BACKGROUND_COLORS[index];

};
