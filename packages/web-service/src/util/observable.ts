import { take, lastValueFrom, Observable, Subject } from 'rxjs';

// ********************************************************************************
// lastValueFrom() assumes tht the stream has completed. This does a take(1) to
// ensure that the stream is complete before getting the last value
export const lastValueFromStream = <T>(source: Observable<T>) => {
  const lastValue$ = source.pipe(take(1/*last value*/));
  return lastValueFrom(lastValue$);
};

// ================================================================================
export const subjectStats = <T>(subject: Subject<T>) => ({
  subscribers: subject.observers.length,
  closed: subject.closed,
  isStopped: subject.isStopped,
  hasError: subject.hasError,
});
