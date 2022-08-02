import { isBlank, stringHashCode, UserProfilePrivate, UserProfilePublic } from '@ureeka-notebook/web-service';

// ********************************************************************************
// == Display name ================================================================
// Gets the display name for the given User Profile.
export const getPublicDisplayName = (profile: UserProfilePublic) => getDisplayName(profile.firstName, profile.lastName);
export const getPrivateDisplayName = (profile: UserProfilePrivate) => getDisplayName(profile.firstName, profile.lastName);
const getDisplayName = (firstName?: string, lastName?: string) => {
  const blankFirst = isBlank(firstName),
        blankLast = isBlank(lastName);
  if(blankFirst && blankLast) return 'Anonymous User'/*FIXME: constant*/;
  if(blankFirst) return lastName!;
  if(blankLast) return firstName!;
  return `${firstName} ${lastName}`;
};

// Gets the initials for the given User Profile.
export const getPublicInitials = (profile: UserProfilePublic) => getInitials(profile.firstName, profile.lastName);
export const getPrivateInitials = (profile: UserProfilePrivate) => getInitials(profile.firstName, profile.lastName);
const getInitials = (firstName?: string, lastName?: string ) => {
  const blankFirst = isBlank(firstName),
        blankLast = isBlank(lastName);
  if(blankFirst && blankLast) return 'A'/*FIXME: constant*/;
  if(blankFirst) return lastName!.charAt(0);
  if(blankLast) return firstName!.charAt(0);
  return `${firstName!.charAt(0)}${lastName!.charAt(0)}`;
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
