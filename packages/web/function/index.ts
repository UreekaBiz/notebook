import * as dotenv from 'dotenv';
import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

// ********************************************************************************
// required before anything else is included / run
dotenv.config();

// NOTE: This instance of admin app is initialized without using .env variables
//       since instances running on Cloud Functions will use the Google Application
//       Default Credentials.
// ref: https://firebase.google.com/docs/admin/setup#initialize-without-parameters
admin.initializeApp(functions.config().firebase);

// ********************************************************************************
// NOTE:  each file must be added manually!
export * from './app';