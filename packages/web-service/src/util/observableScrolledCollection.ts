import { limit, query, Query } from 'firebase/firestore';
import { switchMap, BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { getLogger, ServiceLogger } from '../logging';

const log = getLogger(ServiceLogger.UTIL);

// ********************************************************************************
export type QueryObservable<T, R> = (query: Query<T>) => Observable<R[]>;

// --------------------------------------------------------------------------------
/**
 * A scrollable (as in 'scroll down for more data') list of ordered documents.
 * Batches of documents are retrieved when {@link #moreDocuments()} is called until
 * {@link #isExhausted()} returns `true`. In other words, the end of the collection
 * has been reached when {@link #isExhausted()} returns `true`. Because the
 * collection is 'live', more documents may become available at a later time.
 */
export interface Scrollable<T> {
  /** `true` if and only if at the end of the collection (i.e. {@link #next()}
   *   would result in no additional pages). An exhausted collection is not
   *   necessarily permanently exhausted. If more documents are added to the end
   *   of the collection then this will be reset. */
  isExhausted(): boolean;

  /**
   * Starts the process of loading another batch of documents (which are made
   * available to any subscriber to the Observable). If documents are already
   * loading then this has no effect. New documents are *not* expected to be
   * loaded by the time this method returns.
   *
   * @returns `false` if and only if the list {@link #isExhausted()} (meaning 'there
   *          is no more'). (More documents may become available in the future.)
   *          See `isExhausted()` for more information.
   * @see #isExhausted()
   */
  moreDocuments(batchSize?: number): boolean;

  /** @returns an {@link Observable} over the collection of documents. Multiple
   *           subscribers to the same Observable will receive the same documents. */
  documents$(): Observable<T[]>;
}

// ********************************************************************************
export const scrollableQuery = <F, R>(query: Query<F>, queryObservable: QueryObservable<F, R>, scrollSize: number, context: string) =>
  new ScrollableQueryObservable(query, queryObservable, scrollSize, context);

// ********************************************************************************
class ScrollableQueryObservable<T, R> implements Scrollable<R> {
  private readonly desiredDocumentCount$: BehaviorSubject<number>;
  private readonly _documents$: Observable<R[]>;

  // ..............................................................................
  // the total desired number of documents
  // NOTE: this is used to know if there are more documents to be loaded or not.
  //       (Specifically, if this is less than the size of 'documents', then there
  //       aren't more documents to load (otherwise they would have been loaded by
  //       the snapshot listener))
  private desiredDocumentCount: number;

  // the last-loaded number of documents (which is `null` until first loaded)
  private currentDocumentCount: Number | null/*none loaded yet*/ = null/*none until first batch loaded*/;

  // if documents have been requested but haven't been loaded yet
  private isLoading = false/*not loading by default*/;

  // ==============================================================================
  // the label is used solely for context in logging
  public constructor(firestoreQuery: Query<T>, queryObservable: QueryObservable<T, R>, private readonly batchSize: number, private readonly label: string) {
    this.desiredDocumentCount = batchSize;
    this.desiredDocumentCount$ = new BehaviorSubject(batchSize);

    // for every change to desiredDocumentCount$, switch to a new Observable over
    // the QueryObservable with the new `desiredDocumentCount`
    this._documents$ = this.desiredDocumentCount$
      .pipe(
        tap(() => {
          this.isLoading = true/*by definition*/
log.debug(`${this.label}:documents$: desiredDocumentCount changed; isExhausted: ${this.isExhausted()}; currentDocumentCount: ${this.currentDocumentCount}; desiredDocumentCount: ${this.desiredDocumentCount}`);
        }),
        // FIXME: cannot use `switchMap` since it unsubscribes from the previous
        //        Observable before subscribing to the new one and this needs
        //        overlapping listeners as per notes above
        switchMap(desiredDocumentCount => {
          const buildQuery = query(firestoreQuery, limit(desiredDocumentCount));
          return queryObservable(buildQuery);
        }),
        tap(tuples => {
          this.isLoading = false/*no longer loading*/;
          this.currentDocumentCount = tuples.length;
        })
      );
  }

  // == Scrollable ================================================================
  public isExhausted(): boolean {
    // if there is no subscriber and no documents have been attempted to be loaded
    // or if a load is currently in progress then the collection is not exhausted
    // (or, more specifically, nothing can be said about the collection)
    if(this.currentDocumentCount === null) return false/*don't know -- default to not exhausted*/;

    return this.currentDocumentCount < this.desiredDocumentCount;
  }

  public moreDocuments(batchSize: number = this.batchSize): boolean {
log.debug(`${this.label}:moreDocuments: isExhausted: ${this.isExhausted()}; currentDocumentCount: ${this.currentDocumentCount}; desiredDocumentCount: ${this.desiredDocumentCount}`);
    // gate incrementing the desired document count if loading or exhausted
    if(this.isLoading) return true/*assume there is more until loaded and know otherwise*/;
    if(this.isExhausted()) return false/*there aren't any more (by definition)*/;

    // extend the limit beyond the current number of desired documents
    // NOTE: because all queries have a limit, there's no need to check the actual
    //       number of loaded documents (i.e. it's bounded by #desiredDocumentCount)
    this.desiredDocumentCount = this.desiredDocumentCount + batchSize;
    this.desiredDocumentCount$.next(this.desiredDocumentCount);

    return !this.isExhausted();
  }

  // ------------------------------------------------------------------------------
  public documents$(): Observable<R[]> {
    return this._documents$;
  }
}
