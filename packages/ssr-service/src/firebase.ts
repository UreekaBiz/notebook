
import * as firebase from 'firebase-admin';

import { isLocalDevelopment, isServerSide } from '@ureeka-notebook/service-common';

// ********************************************************************************
// NOTE: this code is meant to be executed exclusively on the server side, if this
//       error is present on the client side, it means that there is a bad import
//       on the code base. All imports from this package must be exclusively used
//       inside a getServerSideProps function.
// see:  https://nextjs.org/docs/basic-features/data-fetching/get-server-side-props#when-does-getserversideprops-run
if(!isServerSide()) throw new Error('Cannot execute on client side.');

// ********************************************************************************
// NOTE: the Firebase Admin API is initialized using .env variables when in local
//       development. When deployed the environment is automatically set up.
// CHECK: likely the difference between these two should *only* be that of
//        'credential' when in local development
const firebaseConfig = isLocalDevelopment()
  ? { /*local development*/
      credential: firebase.credential.cert({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,

        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY,
      }),
      databaseURL: process.env.NEXT_FIREBASE_DATABASE_URL,
    }
  : { /*deployed*/
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,

      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    };
if(firebase.apps.length < 1/*no other app has been initialized*/) {
  firebase.initializeApp(firebaseConfig);
} /* else -- Firebase won't be initialized again */

export const auth = firebase.auth();
export const firestore = firebase.firestore();
