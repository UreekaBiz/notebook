import * as firebase from 'firebase-admin';

// ********************************************************************************
export const DatabaseTimestamp = firebase.database.ServerValue.TIMESTAMP;
export const DatabaseIncrement = (delta: number) => firebase.database.ServerValue.increment(delta);
export const DatabaseDecrement = (delta: number) => firebase.database.ServerValue.increment(-delta);

export type DataSnapshot = firebase.database.DataSnapshot;
export type Reference = firebase.database.Reference;

// converts from a Firestore Timestamp to a RFC3339 string (YYYY-MM-DDTmm:MM:SS[.SSSSSS]Z)
// NOTE: decimalPlaces (between 0 and 9 inclusive) allows caller to choose granularity
export const RFC3339FromTimestamp = (timestamp: firebase.firestore.Timestamp, decimalPlaces = 6/*BigQuery allows 6 digits max*/) =>
  `${new Date(timestamp.seconds * 1000/*millis*/).toISOString()/*RFC3339 format is based on ISO format*/.split('.')[0]/*Only keeping with seconds (not fractions)*/}.${timestamp.nanoseconds / (10 ** (9/*length of nanoseconds*/ - decimalPlaces))/*fraction of seconds*/}Z`;
