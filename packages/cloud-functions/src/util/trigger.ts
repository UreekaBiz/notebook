import { DocumentSnapshot } from 'firebase-admin/firestore';
import * as functions from 'firebase-functions';

import { ApplicationError } from './error';

// convenience function for working with Firestore Triggers
// ********************************************************************************
export enum ChangeOp {
  Create = 'create',
  Update = 'update',
  Delete = 'delete',
}

// --------------------------------------------------------------------------------
export const computeChangeOp = (change: functions.Change<DocumentSnapshot>) => {
  if(!change.before.exists && change.after.exists) return ChangeOp.Create;
  if(change.before.exists && change.after.exists) return ChangeOp.Update;
  if(change.before.exists && !change.after.exists) return ChangeOp.Delete;
  throw new ApplicationError('functions/internal', 'Unexpected Firestore document change state');
};
