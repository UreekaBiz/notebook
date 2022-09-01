import { DocumentSnapshot } from 'firebase-admin/firestore';
import * as functions from 'firebase-functions';

import { LabelParams, Label_Storage, LABEL } from '@ureeka-notebook/service-common';

import { getChangeState } from '../util/firestore';
import { MediumMemory, wrapOnWrite } from '../util/function';
import { writeLabelPublished } from './labelPublished';

// ********************************************************************************
// every change to a Label may affect the corresponding Published Label
export const onWriteLabel = functions.runWith(MediumMemory)
                                          .firestore.document(LABEL)
                                                    .onWrite(wrapOnWrite<DocumentSnapshot<Label_Storage>, LabelParams>(async (change, context) => {
  const labelId = context.params.labelId/*from path*/;
  const { isLatest } = await getChangeState(change, `Label (${labelId})`);
  if(!isLatest) return/*don't update since not latest (*that* trigger will update)*/;

  // match the state of the Label (e.g. if deleted then the Published Label is deleted)
  // CHECK: allow this to throw which would cause the trigger to be re-run?
  await writeLabelPublished(labelId)/*logs on error*/;
}));
