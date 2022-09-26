import { DocumentReference } from 'firebase-admin/firestore';
import { logger } from 'firebase-functions';

import { computeHashtagPrefixes, Hashtag_Create, isApplicationError, Hashtag_Update, SystemUserId, UserIdentifier } from '@ureeka-notebook/service-common';

import { firestore } from '../firebase';
import { ApplicationError } from '../util/error';
import { ServerTimestamp } from '../util/firestore';
import { hashtagDocument } from './datastore';

// Hashtags are defined in the RTDB and an on-create trigger writes the corresponding
// 'ledger' document to Firebase
// NOTE: once a Hashtag is created then, even if all occurrences are removed, the
//       Firestore document always exist
// ********************************************************************************
// == Create ======================================================================
// writes a Hashtag to the ledger (in Firestore) if and only if that hashtag is
// unique by normalized hash of the hashtag (otherwise the request is logged and
// ignored)
export const createHashtag = async (hashtag: string) => {
  let written = false/*by default didn't write*/;
  try {
    // don't write the ledger document if one already exists for the specified hashtag
    const hashtagDoc = hashtagDocument(hashtag) as DocumentReference<Hashtag_Create>;
    written = await firestore.runTransaction(async (transaction) => {
      const snapshot = await transaction.get(hashtagDoc);
      if(snapshot.exists) return false/*already exists*/;

      const document: Hashtag_Create = {
        hashtag,

        searchPrefixes: computeHashtagPrefixes(hashtag),

        removed: false/*by contract*/,

        lastUpdatedBy: SystemUserId/*by definition*/,
        updateTimestamp: ServerTimestamp/*server set by contract*/,
        createdBy: SystemUserId/*by definition*/,
        createTimestamp: ServerTimestamp/*server set by contract*/,
      };
      transaction.create(hashtagDoc, document)/*explicit create so fails if already exists*/;

      return true/*wrote document*/;
    });
  } catch(error) {
    logger.error(`Could not create Hashtag ledger for Hashtag (${hashtag}). Reason: `, error);
  }
  if(!written) logger.warn(`A Hashtag ledger document already exists for Hashtag (${hashtag}). Ignoring.`);
  else logger.info(`Created Hashtag ledger document for Hashtag (${hashtag}).`);

  return written;
};

// == Update ======================================================================
// NOTE: this is an Admin-only function. The caller must auth the User.
export const updateHashtag = async (userId: UserIdentifier, hashtag: string, removed: boolean) => {
  try {
    const hashtagDoc = hashtagDocument(hashtag);
    await firestore.runTransaction(async (transaction) => {
      const snapshot = await transaction.get(hashtagDoc);
      if(!snapshot.exists) throw new ApplicationError('functions/not-found', `Could not find Hashtag ledger for Hashtag (${hashtag}) for User (${userId})`);

      const document: Hashtag_Update = {
        removed,

        lastUpdatedBy: userId,
        updateTimestamp: ServerTimestamp/*server set by contract*/,
      };
      transaction.set(hashtagDoc, document);
    });
  } catch(error) {
    if(isApplicationError(error)) throw error/*rethrow*/;
    logger.error(`Could not update Hashtag ledger for Hashtag (${hashtag}) for User (${userId}). Reason: `, error);
  }
};

// == Delete ======================================================================
// NOTE: Hashtag 'ledger' documents are never deleted at this time though they may be
//       flagged as 'removed'
