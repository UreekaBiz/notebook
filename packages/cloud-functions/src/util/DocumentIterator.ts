// ********************************************************************************
// the number of documents retrieved per batch when iterating over a Query
export const COLLECTION_BATCH_SIZE = 25/*TODO: guess!*/;

// ********************************************************************************
/** Sentinel value returned by a {@link DocumentIterator#next()} if the iterator
 *  has been exhausted */
export const Exhausted = Symbol('Exhausted');

// --------------------------------------------------------------------------------
export interface DocumentIterator<T> {
  /** @returns the next document (as a Firestore {@link DocumentIterator}) or
   *           {@link Exhausted} if there are no more documents */
  next(): Promise<T | typeof Exhausted>;
}

// == Util ========================================================================
// asynchronously consumes the contents of the specified DocumentIterator in batches
// until exhausted
export const batchConsumeDocuments = async <T, R>(
  iterator: DocumentIterator<T>, callbackfn: (value: T, index: number) => R | Promise<R>,
  batchSize: number = COLLECTION_BATCH_SIZE
): Promise<number>/*number of documents consumed*/ => {
  batchSize = (batchSize < 1) ? 1/*sanity bounds*/ : batchSize;

  let index = 0;
  let exhausted = false/*true when iterator is exhausted*/;
  while(!exhausted) {
    let batchCount = 0/*reset with each batch*/;
    const promises: (R | Promise<R>)[] = []/*callbackfn Promises*/;
    while(!exhausted && (batchCount++ < batchSize)) {
      const document = await iterator.next();
      if(document === Exhausted) {
        exhausted = true/*by definition*/;
        break/*completely exhausted*/;
      } /* else -- there was a document (i.e. the iterator is not exhausted) */

      promises.push(callbackfn(document, index++));
    }
    await Promise.all(promises);
  }
  return index;
};
