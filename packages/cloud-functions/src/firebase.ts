import * as firebase from 'firebase-admin';

// ********************************************************************************
export const auth = firebase.auth();
export const database = firebase.database();
export const firestore = firebase.firestore();
export const messaging = firebase.messaging();

// ................................................................................
// set default Firestore settings
firestore.settings({
  timestampsInSnapshots: true/*recommended default*/
});
