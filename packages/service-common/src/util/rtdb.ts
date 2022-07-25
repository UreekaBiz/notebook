// Firebase common functions, etc. shared between Web and Cloud Functions
// These are necessary to allow service-common code to be independent of Firebase
// (which has different API's for the client and server)
// *********v**********************************************************************

/** convenience to make an RTDB field's deletion intent obvious */
// REF: https://firebase.google.com/docs/database/web/read-and-write#delete_data
export const DeleteRecord = null/*by definition*/;

// --------------------------------------------------------------------------------
/** convenience type for RTDB timestamp storage type */
export type RTDBTimestamp = number/*time since the Unix epoch, in milliseconds*/;

/** convenience update type for Timestamp fields in Firebase (Database / RTDB) */
export type DatabaseTimestamp =
    RTDBTimestamp // storage type
  | null // delete -- CHECK: does this state exist for the RTDB as it does with Firestore?
  | Object // on either the client or server to inform the server to set the timestamp
           // (i.e. ServerValue.TIMESTAMP)
  ;
