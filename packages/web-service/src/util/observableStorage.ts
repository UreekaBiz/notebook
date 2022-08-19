import { UploadTask, UploadTaskSnapshot } from 'firebase/storage';
import { distinctUntilChanged, Observable } from 'rxjs';

import { nextTick } from './process';

// ********************************************************************************
export const fromUploadTask = (uploadTask: UploadTask): Observable<UploadTaskSnapshot> =>
  new Observable<UploadTaskSnapshot>(subscriber => {
    const onProgress = (snapshot: UploadTaskSnapshot): void => subscriber.next(snapshot),
          onComplete = () => subscriber.complete(),
          onError = (error: Error) => subscriber.error(error);

    // send the current state as of creation (so the caller doesn't have to wait
    // for the next state change)
    onProgress(uploadTask.snapshot);

    // send each subsequent state change, error or completion
    const unsubscribe = uploadTask.on('state_changed',
      onProgress,
      error => {
        onProgress(uploadTask.snapshot);
        nextTick(() => onError(error));
      },
      () => { /*complete*/
        onProgress(uploadTask.snapshot);
        nextTick(() => onComplete());
      }
    );
    return () => unsubscribe();
  }).pipe(
    distinctUntilChanged()
  );
