import * as firebase from 'firebase-admin';
import { DocumentReference, DocumentSnapshot, Query, QuerySnapshot, Transaction, WriteBatch } from 'firebase-admin/firestore';
import * as functions from 'firebase-functions';

import { nameof, TimestampValue, Updatable } from '@ureeka-notebook/service-common';

import { ApplicationError } from './error';
import { firestore } from '../firebase';
import { ChangeOp } from './trigger';

// ********************************************************************************
// ================================================================================
// aliasing for convenience

export const FIRESTORE_BATCH_SIZE = 400/*must be <500 by Firestore constraint*/;

// -- Firebase --------------------------------------------------------------------
export type FirebaseError = firebase.FirebaseError;
// type-guard
// NOTE: this will also pick up ApplicationError so proceed with caution!
export const isFirebaseError = (error: any): error is FirebaseError =>
  (nameof<FirebaseError>('code') in error);

// -- Firestore -------------------------------------------------------------------
export type DecodedIdToken = firebase.auth.DecodedIdToken;
export type UserRecord = firebase.auth.UserRecord;

export const arrayRemove = firebase.firestore.FieldValue.arrayRemove;
export const arrayUnion = firebase.firestore.FieldValue.arrayUnion;
export const DeleteField = firebase.firestore.FieldValue.delete();
export const FieldPath = firebase.firestore.FieldPath;
export const ServerTimestamp = firebase.firestore.FieldValue.serverTimestamp();
export const TimestampFromDate = firebase.firestore.Timestamp.fromDate;

// ................................................................................
export const TimestampFromNow = () =>
  TimestampFromMills(Date.now());
export const TimestampFromMills = (millis: number) =>
  TimestampFromDate(new Date(millis));
export const TimestampFromISO8601 = (s: string) =>
  firebase.firestore.Timestamp.fromDate(new Date(s));
export const TimestampFromValueOf = (timestampValue: TimestampValue) => {
  // TimestampValue is in the form: <seconds> '.' <nanoseconds>
  // REF: https://github.com/googleapis/nodejs-firestore/blob/master/dev/src/timestamp.ts
  const match = timestampValue.match(/^([^\.]+).([^$]+)$/);
  if(!match || (match.length !== 3/*2 + 1*/)) throw new ApplicationError('functions/invalid-argument', `Invalid Timestamp#valueOf() '${timestampValue}'.`);
  return new firebase.firestore.Timestamp(Number(match[/*$*/1]), Number(match[/*$*/2]));
};

// ================================================================================
// SEE: https://www.typescriptlang.org/docs/handbook/declaration-files/by-example.html#overloaded-functions
export function getSnapshot<T>(transaction: Transaction | undefined, documentRef: DocumentReference<T>): Promise<DocumentSnapshot<T>>
export function getSnapshot<T>(transaction: Transaction | undefined, query: Query<T>): Promise<QuerySnapshot<T>>;
export function getSnapshot<T>(transaction: Transaction | undefined, documentRefOrQuery: DocumentReference<T> | Query<T>): Promise<DocumentSnapshot<T> | QuerySnapshot<T>>{
  // use transaction if available
  if(transaction) {
    // NOTE: this is required to avoid a TypesScript error.
    if(documentRefOrQuery instanceof DocumentReference) return transaction.get(documentRefOrQuery);
    return transaction.get(documentRefOrQuery);
  } /* else -- use firestore directly */
  return documentRefOrQuery.get();
};

// == Trigger Change ==============================================================
// determines the current state based on the specified Change from an on-write trigger
export type ChangeState<T extends Updatable> = {
  changeOp: ChangeOp;
  isLatest: boolean/*true IFF the 'after' document is the latest document*/;
  validDocument: T/*'before' if deleted or 'after' if created*/;
  previousDocument: T/*'before'*/ | undefined/*created (matches .data() if new)*/;
  afterDocument: T/*'after'*/ | undefined/*deleted (matches .data() if deleted)*/;
  latestDocument: T/*'after'*/ | undefined/*deleted (matches .data() if deleted)*/;
};
export const getChangeState = async <T extends Updatable>(change: functions.Change<DocumentSnapshot<T>>, label: string): Promise<ChangeState<T>> => {
  const beforeDocument = change.before.data(),
        afterDocument = change.after.data();
  const previousDocument = beforeDocument/*by definition*/;

  let changeOp: ChangeOp;
  let validDocument: T;
  if(!change.before.exists && change.after.exists) { changeOp = ChangeOp.Create; validDocument = afterDocument!; }
  else if(change.before.exists && change.after.exists) { changeOp = ChangeOp.Update; validDocument = afterDocument!; }
  else if(change.before.exists && !change.after.exists) { changeOp = ChangeOp.Delete; validDocument = beforeDocument!; }
  else throw new ApplicationError('functions/internal', `Unexpected state where Firestore on-write trigger contained neither 'before' or 'after' documents for ${label}.`);

  // get the latest document from Firestore and compare with 'after'
  let isLatest: boolean;
  let latestDocument: T/*'after'*/ | undefined/*deleted (matches .data() if deleted)*/;
  try {
    const snapshot = await change.after.ref.get();
    if(!snapshot.exists) { /*deleted*/
      isLatest = (changeOp === ChangeOp.Delete)/*can only be latest if ChangeOp shows Delete*/;
      latestDocument = undefined/*by contract*/;
    } else { /*there is a document*/
      const document = snapshot.data()!;

      // NOTE: because document cannot be resurrected, the latest document cannot
      //       be not-deleted yet have the 'after' document deleted therefore the
      //       'after' document must exist at this point
      if(!afterDocument) throw new ApplicationError('functions/internal', `Unexpected resurrected 'after' Firestore document for ${label}.`);
      isLatest = (getUpdateTimestamp(afterDocument) >= getUpdateTimestamp(document));
      latestDocument = isLatest ? afterDocument : document;
    }
  } catch(error) {
    throw new ApplicationError('datastore/read', `Error reading latest ${label}. Reason: ${error}`);
  }

  return { changeOp, isLatest, validDocument: validDocument, previousDocument, afterDocument, latestDocument };
};
const getUpdateTimestamp = <T extends Updatable>(document: T) => document.updateTimestamp.valueOf()/*compare using valueOf()*/;

// == Batch =======================================================================
export type WriteBatchCallback<T> = (batch: WriteBatch, value: T) => void;
export const writeBatch = async <T>(iterator: IterableIterator<T>, callback: WriteBatchCallback<T>) => {
  let exhausted = false/*true when iterator is exhausted*/;
  while(!exhausted) {
    const batch = firestore.batch();

    let batchCount = 0/*reset with each batch*/;
    while(batchCount < FIRESTORE_BATCH_SIZE) { /*NOTE: no check for !exhausted since will always be true. If logic changes, re-evaluate presence of condition*/
      const entry = iterator.next();
      if(entry.done) {
        exhausted = true/*by definition*/;
        break/*completely exhausted*/;
      } /* else -- there was a member */
      batchCount++/*exists so count*/;

      callback(batch, entry.value);
    }
    if(batchCount > 0) await batch.commit();
  }
};
