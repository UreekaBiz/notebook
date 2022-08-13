import { forkJoin, iif, lastValueFrom, map, of, switchMap, take, Observable, Subject } from 'rxjs';

// ********************************************************************************
// NOTE: parallels QuerySnapshotObservable
// SEE: #paginatedArray()
export type ArrayObservable<T, R> = (array: T[]) => Observable<R[]>;

// ********************************************************************************
// lastValueFrom() assumes tht the stream has completed. This does a take(1) to
// ensure that the stream is complete before getting the last value
export const lastValueFromStream = <T>(source: Observable<T>) => {
  const lastValue$ = source.pipe(take(1/*last value*/));
  return lastValueFrom(lastValue$);
};

// ================================================================================
// NOTE: detail$ *must* return a value otherwise this stream will never complete
// TODO: turn this into an Operator
export const joinDetail$ = <M, D, R>(master$: Observable<M[]>, detail$: (value: M) => Observable<D>, join: (master: M, detail: D) => R) =>
  master$
    .pipe(
//tap(masterValues => console.error(`joinDetail$ (${masterValues.length})`)),
      switchMap(masterValues =>
        iif(() => (masterValues.length < 1),
          of([] as R[])/*emits empty when no master values*/,
          forkJoin(masterValues.map(masterValue => /*for each master value*/
            detail$(masterValue)/*get detail for the master value*/
              .pipe(
                take(1)/*only the first value is taken from detail$ regardless if it completes or not*/,
                map(detailValue => join(masterValue, detailValue))/*join to resulting type*/
//tap(() => console.error(`    joinDetail$: master-detail join`)),
              )
            )
          ) /*wait for the detail value to be retrieved*/
        ) /*ensures that something is emitted even if 'masterValues' is empty*/
      ) /*switch to which ever values are the latest (cancelling any inner lookups if they weren't complete)*/
//tap(() => console.error(`joinDetail$ - joined`)),
    );

// ================================================================================
export const subjectStats = <T>(subject: Subject<T>) => ({
  subscribers: subject.observers.length,
  closed: subject.closed,
  isStopped: subject.isStopped,
  hasError: subject.hasError,
});
