// Firebase common functions, etc. shared between Web and Cloud Functions
// These are necessary to allow service-common code to be independent of Firebase
// (which has different API's for the client and server)
// *********v**********************************************************************

// REF: https://firebase.google.com/docs/reference/node/firebase.firestore.FieldValue
export declare class FieldValue {
  static arrayRemove(...elements: any[]): FieldValue;
  static arrayUnion(...elements: any[]): FieldValue;

  static serverTimestamp: FieldValue;

  static delete(): FieldValue;

  isEqual(other: FieldValue): boolean;
}

// --------------------------------------------------------------------------------
// REF: https://firebase.google.com/docs/reference/node/firebase.firestore.Timestamp
export declare class Timestamp {
  static now(): Timestamp;
  static fromDate(date: Date): Timestamp;
  static fromMillis(milliseconds: number): Timestamp;

  seconds: number;
  nanoseconds: number;
  toDate(): Date;
  toMillis(): number;
  isEqual(other: Timestamp): boolean;
  valueOf(): string;
}

export type FirestoreTimestamp =
    Timestamp/*as stored*/
  | null/*value on client if FieldValue.serverTimestamp() is sent (but before the ack)*/
  | FieldValue/*FieldValue.serverTimestamp()*/
  ;

export type TimestampValue = string/*to represent Timestamp#valueOf*/;

// -- Convenience -----------------------------------------------------------------
/** allows an array field to be updated */
export type FirestoreArray = FieldValue;

// ================================================================================
export type Unsubscribe = () => void;

// == Timestamp Comparators =======================================================
// returns 'a' if 'a <= b' otherwise 'b'
export const minTimestamp = (a: Timestamp, b: Timestamp) => {
  // REF: https://firebase.google.com/docs/reference/js/firebase.firestore.Timestamp#valueof
  const aValue = a.valueOf(),
        bValue = b.valueOf();
  return (aValue <= bValue)
            ? a/*a <= b*/
            : b/*b < a*/;
};

// returns 'a' if 'a >= b' otherwise 'b'
export const maxTimestamp = (a: Timestamp, b: Timestamp) => {
  // REF: https://firebase.google.com/docs/reference/js/firebase.firestore.Timestamp#valueof
  const aValue = a.valueOf(),
        bValue = b.valueOf();
  return (aValue >= bValue)
            ? a/*a >= b*/
            : b/*b > a*/;
};

// == Schema ======================================================================
// TODO: Create timestamp schema validators
// export const StoredTimestamp_Schema = Validate.object({
//   _seconds: Validate.number()
//           .required(),
//   _nanoseconds: Validate.number()
//           .required(),
// }).noUnknown();

// export const Timestamp_Schema = Validate.object({
//   seconds: Validate.number()
//           .required(),
//   nanoseconds: Validate.number()
//           .required(),
// }).noUnknown();
