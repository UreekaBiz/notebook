import * as functions from 'firebase-functions';
import { logger } from 'firebase-functions';

import { HASHTAG_SUMMARY } from '@ureeka-notebook/service-common';

import { createHashtag } from './hashtag';

// ********************************************************************************
// when a HashtagSummary is created then the corresponding Firestore Hashtag
// 'ledger' record is created by contract
export const onCreateHashtagSummary = functions.database.ref(HASHTAG_SUMMARY)
                                                            .onCreate(async (snapshot) => {
  const hashtag = snapshot.ref.key!/*by definition*/;
  logger.info(`Hashtag Summary created for '${hashtag}.`);

  await createHashtag(hashtag);
});
