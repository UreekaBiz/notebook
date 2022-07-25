
import * as firebase from 'firebase-admin';

import { isServerSide } from '@ureeka-notebook/service-common';

// ********************************************************************************
// NOTE: This code is meant to be executed exclusively on the server side, if this
//       error is present on the client side, it means that there is a bad import
//       on the code base. All imports from this package must be exclusively used
//       inside a getServerSideProps function.
// see:  https://nextjs.org/docs/basic-features/data-fetching/get-server-side-props#when-does-getserversideprops-run
if(!isServerSide()) throw new Error('Cannot execute on client side.');

// ********************************************************************************
// NOTE: This instance of admin app is initialized using .env variables instead of
//       being directly initialized by Firebase like cloud-functions since this can
//       be executed in local development.
const firebaseConfig = {
  credential: firebase.credential.cert({
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY,
  }),
  databaseURL: process.env.NEXT_FIREBASE_DATABASE_URL,
};
if(firebase.apps.length < 1/*no other app has been initialized*/) {
  firebase.initializeApp(firebaseConfig);
} /* else -- admin app won't be initialized again */

export const auth = firebase.auth();
export const firestore = firebase.firestore();
