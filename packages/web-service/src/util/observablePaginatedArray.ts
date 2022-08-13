import { combineLatest, map, switchMap, tap, BehaviorSubject, Observable } from 'rxjs';

import { getLogger, ServiceLogger } from '../logging';
import { ArrayObservable } from './observable';
import { Pagination } from './pagination';

const log = getLogger(ServiceLogger.UTIL);

// ********************************************************************************
export const paginatedArray = <T, R>(array: Observable<T[]>, arrayObservable: ArrayObservable<T, R>, pageSize: number, context: string) =>
  new PaginatedArrayObservable(array, arrayObservable, pageSize, context);

// ********************************************************************************
class PaginatedArrayObservable<T, R> implements Pagination<R> {
  // the 1-based page number
  private readonly pageNumber$ = new BehaviorSubject<number>(1/*first page*/);
  private readonly _documents$: Observable<R[]>;

  // ..............................................................................
  // if documents have been requested but haven't been loaded yet
  private isLoading = false/*not loading by default*/;

  // when the number of tuples returned is less than the page size then the query
  // is exhausted
  protected _isExhausted = false/*default not exhausted*/;

  // ==============================================================================
  // the label is used solely for context in logging
  public constructor(private readonly array$: Observable<T[]>, arrayObservable: ArrayObservable<T, R>, private readonly pageSize: number, private readonly label: string) {
    // for every value added to direction$: switch to a new Observable over the
    // query for the new Page, record that Page in the stack and finally pass that
    // Page's snapshot through the snapshot$ observable
    this._documents$ = combineLatest([this.pageNumber$, this.array$])
      .pipe(
        tap(([pageNumber]) => {
          log.debug(`${this.label}: isLoading: ${this.isLoading}; isExhausted: ${this.isExhausted()}; pageSize: ${this.pageSize}; pageNumber: ${pageNumber}`);
          this.isLoading = true/*set to loading*/;
        }),
        map(([pageNumber, array]) => array.slice((this.pageSize * (pageNumber - 1)), this.pageSize)),
        switchMap(pageArray => arrayObservable(pageArray)),
        tap(pageArray => {
          this.isLoading = false/*finished loading*/;
          this._isExhausted = (pageArray.length < this.pageSize)/*update if exhausted*/;
        })
      );
  }

  // == Pagination ================================================================
  public isExhausted(): boolean { return this._isExhausted; }
  public getPageNumber(): number { return this.pageNumber$.value; }

  // ------------------------------------------------------------------------------
  public previous(): boolean {
    // prevent loading more data if loading or exhausted
    if(this.isLoading) return true/*assume there is more until loaded and know otherwise*/;
    if(this.isExhausted()) return false/*there aren't any more (by definition)*/;
    if(this.pageNumber$.value <= 1) return false/*there aren't any more (by definition)*/;

    this.pageNumber$.next(this.pageNumber$.value - 1);

    return (this.pageNumber$.value > 1);
  }

  public next(): boolean {
    // prevent loading more data if loading or exhausted
    if(this.isLoading) return true/*assume there is more until loaded and know otherwise*/;
    if(this.isExhausted()) return false/*there aren't any more (by definition)*/;

    this.pageNumber$.next(this.pageNumber$.value + 1);

    return !this.isExhausted();
  }

  // ------------------------------------------------------------------------------
  public documents$(): Observable<R[]> { return this._documents$; }
}
