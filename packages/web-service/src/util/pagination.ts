import { Observable } from 'rxjs';

// ********************************************************************************
/**
 * A Paginated list of data. Pagination is controlled via {@link #previous()} and
 * {@link #next()} and the current page is determined by {@link #getPageNumber()}.
 *
 * {@link #next()} can be called until {@link #isExhausted()} returns `true`. In
 * other words, the end of the list is reached when {@link #isExhausted()} returns
 * `true`. If the list is an exact multiple of the page size then the end of the
 * list will unfortunately be an empty result (which should be suitably handled
 * with a 'There are no more results' indicator).
 *
 * {@link #previous()} can be called while {@link #getPageNumber()} is greater
 * than one (i.e. on any page except the first one).
 */
export interface Pagination<T> {
  /** `true` if and only if at the end of the collection (i.e. {@link #next()}
   *  would result in no additional pages) */
  isExhausted(): boolean;
  /** The page size for convenience */
  getPageSize(): number;

  /** The 1-based page number of the current page. This is valid only after
   *  {@link #onUpdate()} has been called. Specifically, this number represents
   *  the page that was last returned by {@link #documents$()}. If called before
   *  the first time that a result has been returned from {@link #documents$()}
   *  then zero is returned. */
  getPageNumber(): number;

  /** Starts to retrieve the previous page of data (made available through
   *  {@link #documents$()} if there is one. {@link #getPageNumber()} (or receiving
   *  a new batch of documents via {@link #documents$()}) is used to know if the
   *  page has changed as a result of calling this method. Calling this method when
   *  at the start of the list has no effect.
   *  @returns `false` if the current page number is less than or equal to one */
  previous(): boolean;
  /** Starts to retrieve the next page of data (made available through
   *  {@link #documents$()} if there is one. {@link #getPageNumber()} (or receiving
   *  a new batch of documents via {@link #documents$()}) is used to know if the
   *  page has changed as a result of calling this method. Calling this method when
   *  at the end of the list has no effect.
   *  @returns `true` if the collection is not *currently* known to be exhausted. */
  next(): boolean;

  /** @returns an {@link Observable} over the list of documents. Multiple subscribers
   *           to the same Observable will receive the same documents. */
  documents$(): Observable<T[]>;
}
