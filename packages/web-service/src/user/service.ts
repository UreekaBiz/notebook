import { lastValueFrom, Observable } from 'rxjs';

import { ObjectTuple, UserIdentifier, UserProfilePublicTuple, UserProfilePublic_Storage } from '@ureeka-notebook/service-common';

import { ApplicationError } from '../util/error';
import { typeaheadFindProfiles$, userProfileById$, userProfileOnceById$ } from './observable';

// TODO: think through if soft deleted Users should be returned or not. Guts says
//       that it has to be 'yes' since there will be references to them that have
//       to be resolved to a User!
// ********************************************************************************
export class UserProfileService {
  // == Singleton =================================================================
  private static singleton: UserProfileService;
  public static create() { return (UserProfileService.singleton = new UserProfileService()); }
  public static getInstance() { return UserProfileService.singleton; }

  // == Observables ===============================================================
  /**
   * @param userId the {@link UserIdentifier} for which the {@link UserProfilePublic}
   *         is desired
   * @returns Observable over {@link UserProfilePublic} with the specified identifier.
   *          If no such Users exists then `null` is returned. Note that the User
   *          _may be_ soft deleted {@link UserProfilePublic#deleted}.
   */
  public onUserProfile$(userId: UserIdentifier): Observable<ObjectTuple<UserIdentifier, UserProfilePublic_Storage | null/*not-found*/>> {
    return userProfileById$(userId);
  }

  // == Read ======================================================================
  /**
   * @param userId the {@link UserIdentifier} for which the {@link UserProfilePublic}
   *         is desired
   *  @returns the {@link UserProfilePublic} for the specified {@link UserIdentifier}.
   *           Note that the User _may be_ soft deleted {@link UserProfilePublic#deleted}.
   *  @throws {@link ApplicationError}
   *  - `not-found` if the specified {@link UserIdentifier} does not represent a
   *    known User
   */
  public async getUserProfile(userId: UserIdentifier): Promise<UserProfilePublic_Storage> {
    const userProfile = await lastValueFrom(userProfileOnceById$(userId));
    if(userProfile === null/*not-found*/) throw new ApplicationError('functions/not-found', `Could not find User Profile Public for User Id (${userId}).`);
    return userProfile;
  }

  // == Search ====================================================================
  // -- Typeahead-find Search -----------------------------------------------------
  /**
   * @param query a non-blank trimmed user query prefix for typeahead find-style
   *        searches
   * @returns zero or more Users that match the specified prefix in lexicographical
   *          order. This result is bound to return at most {@link MAX_USER_SEARCH_RESULTS}
   *          results. If the max number are returned then it is safe to assume
   *          that there are more than the max.
   */
  public async typeaheadSearchProfiles(query: string): Promise<UserProfilePublicTuple[]> {
    return await lastValueFrom(typeaheadFindProfiles$(query));
  }

  // == Stats =====================================================================
  public stats() {
    return {
      // NOTE: currently none
    };
  }
}
