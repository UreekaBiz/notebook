import * as client from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';
import { getStorage } from 'firebase/storage';

// ********************************************************************************
const firebaseConfig = {
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,

  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,

  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// NOTE: Client side is initialized in both the server-side and client-side.
//       Ideally the client app should only be initialized on the client-side, but
//       there is no easy way to prevent the client app from being initialized on
//       the server-side due to how the app is initialized when this file is
//       imported on web-service.
//       A solution could be to only initialize the client, firestore, functions
//       and auth only when its on the client side, but that will require more
//       code and for simplicity it will be as it is, initialized on the server side
//       but not being used.
if(client.getApps().length < 1/*no other app has been initialized*/) {
  client.initializeApp(firebaseConfig);
} /* else -- client app won't be initialized */
// CHECK: what is the state of the vars below in the 'else' case?

export const database  = getDatabase(client.getApp());
export const firestore = getFirestore(client.getApp());
export const functions = getFunctions(client.getApp());
export const storage = getStorage(client.getApp());

// -- Auth ------------------------------------------------------------------------
// TODO: configure Auth to reduce dependencies
// REF: https://firebase.google.com/docs/auth/web/custom-dependencies
export const auth = getAuth(client.getApp());
// NOTE: the default persistence is 'local' which is desired (so not set explicitly)
// REF: https://firebase.google.com/docs/auth/web/auth-state-persistence

// REF: https://firebase.google.com/docs/auth/web/google-signin#customizing-the-redirect-domain-for-google-sign-in
// REF: https://developers.google.com/identity/protocols/oauth2/scopes
export const googleAuthProvider = new GoogleAuthProvider();
             googleAuthProvider.addScope('https://www.googleapis.com/auth/userinfo.email')/*for email*/;
             googleAuthProvider.addScope('https://www.googleapis.com/auth/userinfo.profile')/*for display name and profile pic*/;
export const signInWithGooglePopup = async () => signInWithPopup(auth, googleAuthProvider);

export const signOut = () => { auth.signOut(); };
