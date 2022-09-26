import { DocumentReference } from 'firebase-admin/firestore';

import { defaultVersion, removeUndefined, UserIdentifier, Version_Write, WebVersionWrite_Rest } from '@ureeka-notebook/service-common';

import { firestore } from '../firebase';
import { ApplicationError } from '../util/error';
import { DeleteField, ServerTimestamp } from '../util/firestore';
import { latestVersionQuery, versionCollection } from './datastore';

// ********************************************************************************
// == Write =======================================================================
export const writeVersion = async (
  userId: UserIdentifier,
  web: WebVersionWrite_Rest | null/*remove*/ | undefined/*not specified*/
) => {
  try {
    const versionRef = versionCollection.doc(/*create new*/) as DocumentReference<Version_Write>;
    await firestore.runTransaction(async transaction => {
      const snapshot = await transaction.get(latestVersionQuery);
      const previousVersion = !snapshot.empty ? snapshot.docs[0/*only one by definition*/].data() : defaultVersion;

      const document: Version_Write = {
        ...previousVersion,

        web: (web === null/*specified but no value*/) ? DeleteField : web,

        lastUpdatedBy: userId,
        updateTimestamp: ServerTimestamp/*by contract*/,
      };
      transaction.create(versionRef, removeUndefined(document) as Version_Write)/*create by definition*/;
    });
  } catch(error) {
    if(error instanceof ApplicationError) throw error;
    throw new ApplicationError('datastore/write', `Error creating new Version for User (${userId}). Reason: `, error);
  }
};
