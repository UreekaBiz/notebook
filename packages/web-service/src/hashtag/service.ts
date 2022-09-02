import { lastValueFrom } from 'rxjs';

import { HashtagSearchResult } from '@ureeka-notebook/service-common';

import { getLogger, ServiceLogger } from '../logging';
import { adminHashtagRemoveUpdate } from './function';
import { typeaheadFindHashtags$ } from './observable';

const log = getLogger(ServiceLogger.HASHTAG);

// ********************************************************************************
export class HashtagService {
  // == Singleton =================================================================
  private static singleton: HashtagService;
  public static create() { return (HashtagService.singleton = new HashtagService()); }
  public static getInstance() { return HashtagService.singleton; }

  // == Lifecycle =================================================================
  protected constructor() {/*nothing at this time*/}
  public shutdown() {
    log.info(`Shutting down Hashtag service ...`);
  }

  // == Search ====================================================================
  // -- Typeahead-find Search -----------------------------------------------------
  /**
   * @param query a non-blank trimmed hashtag query prefix for typeahead find-style
   *        searches
   * @returns zero or more hashtags (as string) that match the specified prefix in
   *          lexicographical order. This result is bound to return at most {@link MAX_HASHTAG_SEARCH_RESULTS}
   *          results. If the max number are returned then it is safe to assume
   *          that there are more than the max.
   */
  public async typeaheadSearchHashtags(query: string): Promise<HashtagSearchResult[]> {
    return await lastValueFrom(typeaheadFindHashtags$(query));
  }

  // == Admin-Only ================================================================
  /**
   * @param hashtag the hashtag whose remove flag is to be updated
   * @param remove the state to which the remove flag is to be updated for the
   *        specified hashtag
   */
  public async adminUpdateRemoveFlag(hashtag: string, remove: boolean) {
    await adminHashtagRemoveUpdate({ hashtag, remove });
  }

  // == Stats =====================================================================
  public stats() {
    return {
      // NOTE: none at this time
    };
  }
}
