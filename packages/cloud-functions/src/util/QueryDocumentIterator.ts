import { DocumentSnapshot, Query, QueryDocumentSnapshot } from 'firebase-admin/firestore';
import { logger } from 'firebase-functions';

import { isType } from '@ureeka-notebook/service-common';

// ********************************************************************************
const Exhausted = isType<Promise<IteratorReturnResult<undefined>>>(Promise.resolve({ done: true, value: undefined }))/*by definition*/;
const asyncIteratorResult = <T>(value: T) => isType<IteratorYieldResult<T>>({ done: false, value });

// ********************************************************************************
/**
 * An {@link AsyncIterator} over all documents defined by a {@link Query} (in the
 * order specified by that query) as {@link DocumentSnapshot}s. All documents are
 * *not* live. If new documents were added before the current batch then the are
 * not included in the iterator.
 *
 * @typeparam T the document type
 */
export class QueryDocumentIterator<T> implements AsyncIterator<QueryDocumentSnapshot<T>> {
  // has the query been exhausted?
  private isExhausted: boolean = false/*by definition*/;

  // ..............................................................................
  // NOTE: these are only valid when `isExhausted === false`

  // the last batch of document snapshots retrieved and the snapshot of the last
  // document (then from which the next batch starts-after)
  private documents: QueryDocumentSnapshot<T>[] = []/*initially empty*/;
  private lastDocumentSnapshot: DocumentSnapshot<T> | null = null/*initially no documents*/;

  // the index of the next document snapshot to return from #documents
  private nextIndex = 0/*start at beginning*/;

  // == Life-Cycle ================================================================
  /**
   * @param query the Firestore {@link Query} that is iterated over
   * @param batchSize the number of documents to retrieve in each batch
   */
  public constructor(private readonly query: Query<T>, private readonly batchSize: number) {/*nothing additional*/}

  // == AsyncIterator (protocol) ==================================================
  public async next() { return await this.fetchNextDocument(); }
  public [Symbol.asyncIterator]() { return this; }

  // ==============================================================================
  // fetches the next value from the batch (identified by `nextIndex`) if there is
  // one.  Otherwise a new batch is loaded and the first value fetched
  private async fetchNextDocument(batchSize: number = this.batchSize) {
    if(this.isExhausted) return Exhausted/*by definition*/;

    // if there are insufficient documents in the current batch then load a new
    // batch. If there are no more documents in the query then return Exhausted
    if(this.nextIndex >= this.documents.length) {
      await this.loadNextBatch(batchSize);
      if(this.isExhausted) return Exhausted/*by definition*/;
    } /* else -- still documents in the current batch */

    return asyncIteratorResult(this.documents[this.nextIndex++]/*get and move to next one*/);
  }

  // ..............................................................................
  private async loadNextBatch(batchSize: number) {
    let query = this.query;

    // if there was a previous batch then start after the last document
    if(!!this.lastDocumentSnapshot) {
      query = query.startAfter(this.lastDocumentSnapshot);
    } /* else -- there wasn't a previous batch */

    // limit the result set to the batch size
    query = query.limit(batchSize);

    // get the next batch of documents
    try {
      const snapshot = await query.get();
      if(snapshot.empty) {
        this.isExhausted = true/*by definition*/;
        this.documents = []/*free / clear*/;
      } else { /*there are more documents*/
        this.nextIndex = 0/*start back at beginning*/;
        this.documents = snapshot.docs;
        this.lastDocumentSnapshot = snapshot.docs[snapshot.docs.length - 1];
      }
    } catch(error) {
      logger.error(`Could not load next batch of documents from query. Considering query 'exhausted'. Reason: `, error);

      // treat it as if it was exhausted (by contract)
      // CHECK: is there any other option? Can it retry? (But then it's potentially
      //        out of sync with the other collections...)
      this.isExhausted = true/*by definition*/;
      this.documents = []/*free / clear*/;
    }
  }
}
