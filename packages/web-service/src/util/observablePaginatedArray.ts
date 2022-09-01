import { combineLatest, map, switchMap, tap, BehaviorSubject, Observable } from 'rxjs';

import { getLogger, ServiceLogger } from '../logging';
import { ArrayObservable } from './observable';
import { Pagination } from './pagination';

const log = getLogger(ServiceLogger.UTIL);

// ********************************************************************************
export const paginatedArray = <T, R>(array$: Observable<T[]>, transformArray$: ArrayObservable<T, R>, pageSize: number, context: string) =>
  new PaginatedArrayObservable(array$, transformArray$, pageSize, context);

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
  public constructor(private readonly array$: Observable<T[]>, transformArray$: ArrayObservable<T, R>, private readonly pageSize: number, private readonly label: string) {
    // each time either the page number changes or the array changes: switch to the
    // transform Observable over that page (transformArray$)
    this._documents$ = combineLatest([this.pageNumber$, this.array$])
      .pipe(
        tap(([pageNumber, array]) => {
          log.debug(`${this.label}:array$: isLoading: ${this.isLoading}; isExhausted: ${this.isExhausted()}; pageSize: ${this.pageSize}; pageNumber: ${pageNumber}; array: ${array.length}`);
          this.isLoading = true/*set to loading*/;
        }),
        map(([pageNumber, array]) => array.slice((this.pageSize * (pageNumber - 1)), this.pageSize * pageNumber)),
        switchMap(pageArray => transformArray$(pageArray)),
        tap(pageArray => {
          this.isLoading = false/*finished loading*/;
          this._isExhausted = (pageArray.length < this.pageSize)/*update if exhausted*/;
          log.debug(`${this.label}:array$: loaded; isExhausted: ${this.isExhausted()}; pageSize: ${this.pageSize}; pageArray: ${pageArray.length}`);
        })
      );
  }

  // == Pagination ================================================================
  public isExhausted(): boolean { return this._isExhausted; }
  public getPageSize(): number { return this.pageSize; }

  public getPageNumber(): number { return this.pageNumber$.value; }

  // ------------------------------------------------------------------------------
  public previous(): boolean {
log.debug(`${this.label}:previous: isLoading: ${this.isLoading}; isExhausted: ${this.isExhausted()}; pageNumber: ${this.pageNumber$.value}`);
    // prevent loading more data if loading
    // NOTE: *may* be exhausted but still allow going back
    if(this.isLoading) return true/*assume there is more until loaded and know otherwise*/;
    if(this.pageNumber$.value <= 1) return false/*there aren't any more (by definition)*/;

    this.pageNumber$.next(this.pageNumber$.value - 1);

    return (this.pageNumber$.value > 1);
  }

  public next(): boolean {
log.debug(`${this.label}:next: isLoading: ${this.isLoading}; isExhausted: ${this.isExhausted()}; pageNumber: ${this.pageNumber$.value}`);
    // prevent loading more data if loading or exhausted
    if(this.isLoading) return true/*assume there is more until loaded and know otherwise*/;
    if(this.isExhausted()) return false/*there aren't any more (by definition)*/;

    this.pageNumber$.next(this.pageNumber$.value + 1);

    return !this.isExhausted();
  }

  // ------------------------------------------------------------------------------
  public documents$(): Observable<R[]> { return this._documents$; }
}
