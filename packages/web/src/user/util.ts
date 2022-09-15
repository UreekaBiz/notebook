import { isBlank, stringHashCode, UserProfilePrivate, UserProfilePublic } from '@ureeka-notebook/web-service';

// ********************************************************************************
// == Display name ================================================================
// gets the display name for the given User Profile
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

// gets the initials for the given User Profile
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

// == Background Color ============================================================
/** A collection of colors used as a background colors */
const DEFAULT_IMAGE_BACKGROUND_COLORS = [
  '#C92A2A',
  '#A61E4D',
  '#862E9C',
  '#5F3DC4',
  '#364FC7',
  '#1864AB',
  '#0B7285',
  '#087F5B',
  '#2B8A3E',
  '#5C940D',
  '#E67700',
  '#D9480F',
];

/** Gets a background color from the given userId. This implementation ensures that
 *  the returned value is consistent for a given userId */
export const getBackgroundImageColor = (userId: string) => {
  const hash = stringHashCode(userId);
  // NOTE: A hash can be negative, so we need to make it positive
  const index = Math.abs(hash % DEFAULT_IMAGE_BACKGROUND_COLORS.length);

  return DEFAULT_IMAGE_BACKGROUND_COLORS[index];
};
