import { logger } from 'firebase-functions';

import { removeUndefined, LabelIdentifier, LabelPublished_Write, LabelVisibility, SystemUserId } from '@ureeka-notebook/service-common';

import { firestore } from '../firebase';
import { ServerTimestamp } from '../util/firestore';
import { labelDocument, labelPublishedDocument } from './datastore';

// ********************************************************************************
// == Write =======================================================================
// matches the state of the Label (e.g. if deleted then the Published Label is
// deleted). Published Labels are always fully written based on any change to the Label
export const writeLabelPublished = async (labelId: LabelIdentifier) => {
  try {
    const labelRef = labelDocument(labelId),
          labelPublishedRef = labelPublishedDocument(labelId);
    await firestore.runTransaction(async (transaction) => {
      const snapshot = await transaction.get(labelRef);
      if(snapshot.exists && (snapshot.data()!.visibility === LabelVisibility.Public)) { /*label exists and is Public*/
        const label = snapshot.data()!;
        const labelPublished: LabelPublished_Write = {
          name: label.name,
          description: label.description,

          ordered: label.ordered,
          // FIXME: ONLY INCLUDE PUBLISHED NOTEBOOKS!!!
          notebookIds: label.notebookIds,

          searchNamePrefixes: label.searchNamePrefixes,
          sortName: label.sortName,

          createdBy: SystemUserId/*since from a trigger*/,
          createTimestamp: ServerTimestamp,
        };
        transaction.set(labelPublishedRef, removeUndefined(labelPublished))/*overwrite *not* merge*/;
      } else { /*deleted or not Public*/
        transaction.delete(labelPublishedRef);
      }
    });
  } catch(error) {
    // NOTE: doesn't throw by design
    logger.error(`Error writing Published Label (${labelId}). Reason: `, error);
  }
};
