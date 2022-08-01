import * as dotenv from 'dotenv';
import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

// ********************************************************************************
// required before anything else is included / run
dotenv.config();

// NOTE: this instance of admin app is initialized without using .env variables
//       since instances running on Cloud Functions will use the Google Application
//       Default Credentials.
// REF: https://firebase.google.com/docs/admin/setup#initialize-without-parameters
admin.initializeApp(functions.config().firebase);

// ********************************************************************************

// NOTE:  each file must be added manually!
export * from './authUser/callable';
export * from './authUser/onCreate';
export * from './authUser/onWrite';
export * from './authUser/schedule';
export * from './healthcheck/callable';
export * from './logging/callable';
export * from './migration/task';
export * from './notebook/callable';
export * from './notebookEditor/onCreate';
export * from './export/schedule';
