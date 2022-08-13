import { limit, query, startAfter, startAt, DocumentSnapshot, Query, QuerySnapshot } from 'firebase/firestore';
import { map, switchMap, Observable, ReplaySubject } from 'rxjs';
import { tap } from 'rxjs/operators';

import { ApplicationError } from '@ureeka-notebook/service-common';

import { getLogger, ServiceLogger } from '../logging';
import { QuerySnapshotObservable } from './observableCollection';
import { fromQuery } from './observableFirestore';
import { Pagination } from './pagination';

const log = getLogger(ServiceLogger.UTIL);

// ********************************************************************************
// NOTE: the query can *ONLY* contain `where` and `orderBy` clauses. The addition
//       of any other clauses will produce undefined results
export const paginatedQuery = <F, R>(query: Query<F>, querySnapshotObservable: QuerySnapshotObservable<F, R>, pageSize: number, context: string) =>
  new PaginatedQueryObservable(query, querySnapshotObservable, pageSize, context);

// ********************************************************************************
// each Page consists of 'previous' and 'next' snapshots
// NOTE: this approach has its drawbacks. The primary one is that if the underlying
//       data changes then the page size will (the number of documents returned
//       for that Page will change from what it was previously). This is both a
//       blessing and a curse. The blessing is that it's easy to understand / code.
//       The curse is that it doesn't necessarily meet the User's expectations
//       (i.e. the Pages may be smaller than expected).
// NOTE: it's possible to 'lose' documents on the first Page. This attempts to
//       limit that by always starting at the beginning (whereas the alternative
//       is that there may be documents before the 1st anchor document). But it
//       can fail if there are *additional* documents added in the first Page.
//       BUT! Those would be picked up going 'next' again.
type Page<T> = Readonly<{
  firstDocumentSnapshot: DocumentSnapshot<T> | undefined/*first page in the list*/;
  lastDocumentSnapshot: DocumentSnapshot<T>;
}>;
const createFirstPage = <T>(lastDocumentSnapshot: DocumentSnapshot<T>): Page<T> =>
  ({ firstDocumentSnapshot: undefined/*none by definition*/, lastDocumentSnapshot });
const createPage = <T>(firstDocumentSnapshot: DocumentSnapshot<T>, lastDocumentSnapshot: DocumentSnapshot<T>): Page<T> =>
  ({ firstDocumentSnapshot, lastDocumentSnapshot });

// ................................................................................
type Direction = 'next' | 'previous' | undefined/*first time*/;

type QueryPage<T> = { buildQuery: Query<T>; previousPage: Page<T> | undefined/*first time*/; };

// ================================================================================
class PaginatedQueryObservable<T, R> implements Pagination<R> {
  private readonly direction$ = new ReplaySubject<Direction>(undefined/*first time*/);
  private readonly _documents$: Observable<R[]>;

  // ..............................................................................
  // the 'stack' of Pages (first and last snapshots) needed to know that 'previous'
  // is. It conveniently also determines the current page number.
  // NOTE: there's no obvious/trivial way of paging backwards (i.e. 'previous') as
  //       it requires reversing the sorting direction. This would require the caller
  //       to specify either both sort directions or a builder that would perform
  //       the same function.
  private pages: Page<T>[] = []/*none to start*/;

  // if documents have been requested but haven't been loaded yet
  private isLoading = false/*not loading by default*/;

  // when the number of tuples returned is less than the page size then the query
  // is exhausted
  protected _isExhausted = false/*default not exhausted*/;

  // ==============================================================================
  // the label is used solely for context in logging
  public constructor(private readonly firestoreQuery: Query<T>, querySnapshotObservable: QuerySnapshotObservable<T, R>, private readonly pageSize: number, private readonly label: string) {
    // for every value added to direction$: switch to a new Observable over the
    // query for the new Page, record that Page in the stack and finally pass that
    // Page's snapshot through the snapshot$ observable
    this._documents$ = this.direction$
      .pipe(
        tap(direction => {
          this.logCurrentPage(direction)/*sanity*/;
          this.isLoading = true/*set to loading*/;
        }),
        switchMap(direction => {
          const { buildQuery, previousPage } = this.getQuery(direction);
          return fromQuery(buildQuery)
                    .pipe(map(snapshot => ({ direction, previousPage, snapshot })))/*bundle up the state for the next step*/;
        }),
        switchMap(({ direction, previousPage, snapshot }) => {
          this.recordPage(direction, previousPage, snapshot);

          return querySnapshotObservable(snapshot);
        }),
        tap(tuples => {
          this.isLoading = false/*finished loading*/;
          this._isExhausted = (tuples.length < this.pageSize)/*update if exhausted*/;
        }));
  }

  // ------------------------------------------------------------------------------
  private getQuery(direction: Direction): QueryPage<T> {
    // sanity check
    if(   ((direction === undefined/*initial*/) && (this.pages.length > 0))
       || ((direction !== undefined) && (this.pages.length < 1))) throw new ApplicationError('functions/aborted', `Paginated Listener ${this.label} direction (${direction}) and page number (${this.pages.length}) are inconsistent. Aborting.`);

    // cases:
    // 1. No pages have been retrieved: simply limit the query and start (at the beginning);
    // 2. 'previous' and existing page: pop the Page and startAt() the *new*
    //    current Page's first document;
    // 3. 'next' and existing page: startAfter() the current Page's last document;
    let buildQuery = query(this.firestoreQuery, limit(this.pageSize)/*always limit to the page size*/);
    let previousPage: Page<T> | undefined/*first time*/;
    if(direction === 'previous') {
      if(this.pages.length <= 1) throw new ApplicationError('functions/aborted', `Pagination ${this.label} has no previous pages on 'previous'. Skipping.`);

      // remove the current page and startAt() the start of the previous Page
      // -or- the start of the list if this is the first Page
      this.pages.pop()/*remove current page*/;
      previousPage = this.pages[this.pages.length - 1];
      if(this.pages.length > 1) buildQuery = query(buildQuery, startAt(previousPage.firstDocumentSnapshot));
    } else if(direction === 'next') {
      previousPage = this.pages[this.pages.length - 1]/*guaranteed to have at least one from sanity check*/;
      buildQuery = query(buildQuery, startAfter(previousPage.lastDocumentSnapshot));
    } else { /*direction === undefined*/
      previousPage = undefined/*first time*/;
    }

    return { buildQuery, previousPage };
  }

  // ..............................................................................
  private recordPage(direction: Direction, previousPage: Page<T> | undefined/*initial*/, snapshot: QuerySnapshot<T>): void {
log.debug(`${this.label}: Got Snapshot: ${snapshot.size}; Page: ${this.pages.length}; Direction: ${direction}`);

    // when 'previous' then pop off the current Page and it will be 'replaced' with
    // a new one
    // NOTE: when 'previous' then the Page has already been recorded (by definition)
    //       since the Page is being 'replayed'
    if(direction === 'previous') this.pages.pop()/*remove*/;

    if(snapshot.empty) {
      // if the direction is 'next' and there are no documents then either the list
      // size changed or there were an integral number of Pages and this 'next'd
      // past the end of the list. (See special case below.)
      if(direction === 'previous') { log.warn(`Paginated Listener ${this.label} got no results on 'previous'. Either faulty logic or list became empty.`); return/*nothing to do*/; }
      else if(direction === 'next') {
        log.debug(`Paginated Listener ${this.label} has integral number of documents.`);

        // this is a special case where there are an integral number of documents.
        // In order to 'previous' correctly, this will 'simulate' a Page with the
        // first/last documents being the last document of the previous Page.
        // Specifically, *something* needs to be on the 'stack' so that 'previous'
        // works but since it will be overwritten when there is data it doesn't
        // really matter what it is.
        // NOTE: 'previousPage' exists by contract (see logic above)
        this.pages.push(createPage(previousPage!.lastDocumentSnapshot, previousPage!.lastDocumentSnapshot));
      } else /*direction === undefined*/ log.debug(`Paginated Listener ${this.label} has no documents.`);
    } else { /*there is at least one document*/
      this.pages.push((this.pages.length < 1)
                      ? createFirstPage(snapshot.docs[snapshot.size - 1/*last document*/])
                      : createPage(snapshot.docs[0/*first document*/],
                                  snapshot.docs[snapshot.size - 1/*last document*/]));
log.debug(`${this.label}: Recorded Page: ${this.pages.length}`);
    }
  }

  // == Pagination ================================================================
  public isExhausted(): boolean { return this._isExhausted; }
  public getPageNumber(): number { return this.pages.length; }

  // ------------------------------------------------------------------------------
  public previous(): boolean {
    this.logState('previous')/*for debugging*/;

    // prevent loading more data if loading or exhausted
    if(this.isLoading) return true/*assume there is more until loaded and know otherwise*/;
    if(this.isExhausted()) return false/*there aren't any more (by definition)*/;
    if(this.pages.length <= 1) return false/*there aren't any more (by definition)*/;

    this.direction$.next('previous');

    return (this.pages.length > 1);
  }

  public next(): boolean {
    this.logState('next')/*for debugging*/;

    // prevent loading more data if loading or exhausted
    if(this.isLoading) return true/*assume there is more until loaded and know otherwise*/;
    if(this.isExhausted()) return false/*there aren't any more (by definition)*/;

    this.direction$.next('next');

    return !this.isExhausted();
  }

  // ------------------------------------------------------------------------------
  public documents$(): Observable<R[]> { return this._documents$; }

  // == Logging ===================================================================
  private logCurrentPage(direction: Direction): void {
    const currentPage = (this.pages.length < 1)
                        ? undefined/*none -- initial*/
                        : this.pages[this.pages.length - 1];
    log.debug(`${this.label}: pageNumber: ${this.pages.length}; direction: ${direction}; firstDocRef: ${currentPage?.firstDocumentSnapshot?.id}; lastDocRef: ${currentPage?.lastDocumentSnapshot?.id};`);
  }

  private logState(direction: Direction): void {
    log.debug(`${this.label}:${direction}: isLoading: ${this.isLoading}; isExhausted: ${this.isExhausted()}; pageSize: ${this.pageSize}; pageNumber: ${this.pages.length}`);
  }
}
