import * as Validate from 'yup';

import { PresenceState } from '../authUser/type';
import { Creatable, Updatable } from '../util/datastore';
import { relaxedUrlSchema, stringMedSchema, stringVLongSchema, tiktokHandleSchema, twitterHandleSchema } from '../util/schema';

// ********************************************************************************
// === User ======================================================================
// -- Common Profile Elements ----------------------------------------------------
// NOTE: this is effectively the 'Public' part of the profile (that can be updated)
// NOTE: this schema defines what is copied over from the Private Profile so care
//       must be taken to ensure that these are truly *public* fields
export const UserProfile_Core_Schema = Validate.object({
  profileImageUrl: Validate.string()
          .url()
          .notRequired(),

  firstName: stringMedSchema
          .notRequired(),
  lastName: stringMedSchema
          .notRequired(),

  about: stringVLongSchema
          .notRequired(),

  // .. Social ....................................................................
  socialMedia_facebook: relaxedUrlSchema
          .notRequired(),
  socialMedia_instagram: relaxedUrlSchema
          .notRequired(),
  socialMedia_linkedin: relaxedUrlSchema
          .notRequired(),
  socialMedia_tiktok: tiktokHandleSchema
          .notRequired(),
  socialMedia_twitter: twitterHandleSchema
          .notRequired(),
}).noUnknown();
export type UserProfile_Core = Readonly<Partial<Validate.InferType<typeof UserProfile_Core_Schema>>>/*FIXME: partial is wrong! Yup problem!*/;

// -- Internally-Updated Public Profile Elements ----------------------------------
/** Public Profile fields that are copied from the Private Profile but *cannot* be
 *  updated by the User */
// CHECK: should this include 'Public' to be explicit?
export type UserProfile_Internal = Readonly<{
  /** (optional) email from Firebase Auth */
  // TODO: this would be the first candidate for a 'hide'able' field
  email?: string;

  /** is the User Active, Idle or Offline? */
  presence: PresenceState;

  /** has the User been deleted. This is a one-way latch (i.e. Users are never
   *  resurrected) */
  deleted: boolean;
}>;

/** Public Profile fields that are generated from the Private Profile and are *not*
 *  updated by the User */
export type UserProfile_Generated = Readonly<{
  // CHECK: these name-based fields will be blank and empty (i.e. *not* undefined)
  //        if there is no first or last name. Is that the desired behavior?
  /** in order to support fast prefix (typeahead find) searches, this is the first
   *  #MAX_PREFIX_COUNT * 2 normalized prefixes of the User's name */
  searchNamePrefixes: string[];
  /** normalized name expressly for sorting
   *  @see #userProfileComparator */
  sortName: string;
}>;

// --------------------------------------------------------------------------------
// NOTE: caution must be used as this is seen by *all* Users so private data cannot
//       be exposed
// NOTE: this is *only* updated via an on-write trigger to the Private Profile
// CHECK: should the timestamps be clones of the Private Profile or should they be
//        at the time that the trigger fired? It might be easier for tracking purposes
//        to clone them (since they can be matched to the Private Profile) but then
//        latencies, etc. can't be tracked (which is also useful!)
export type UserProfilePublic =
    Creatable
  & Updatable
  & UserProfile_Core
  & UserProfile_Internal/*'internal' only refers to how they're updated*/
  & UserProfile_Generated
  // NOTE: does **NOT** include private data (UserProfile_Private_Schema) by contract
  ;
