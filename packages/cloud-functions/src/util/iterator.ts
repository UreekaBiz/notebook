// ********************************************************************************
// the number of objects retrieved per batch when iterating over objects
export const ITERATOR_BATCH_SIZE = 25/*TODO: guess!*/;

// ================================================================================
// asynchronously consumes the contents of the specified AsyncIterator in batches
// until exhausted. If any callback function throws then the state of this is
// undefined. Specifically, some or all of the entities may not have been processed.
export const asyncBatchConsume = async <T, R>(
  iterator: AsyncIterator<T> | Iterator<T>, callbackfn: (value: T, index: number) => R | Promise<R>,
  batchSize: number = ITERATOR_BATCH_SIZE
): Promise<number>/*number of elements consumed*/ => {
  batchSize = (batchSize < 1) ? 1/*sanity bounds*/ : batchSize;

  let index = 0;
  let exhausted = false/*true when iterator is exhausted*/;
  while(!exhausted) {
    let batchCount = 0/*reset with each batch*/;
    const promises: (R | Promise<R>)[] = []/*callbackfn Promises*/;
    while(batchCount++ < batchSize) { /*NOTE: no check for !exhausted since will always be true. If logic changes, re-evaluate presence of condition*/
      const entry = await iterator.next();
      if(entry.done) {
        exhausted = true/*by definition*/;
        break/*completely exhausted*/;
      } /* else -- there was an element */

      promises.push(callbackfn(entry.value, index++));
    }
    await Promise.all(promises);
  }
  return index;
};
