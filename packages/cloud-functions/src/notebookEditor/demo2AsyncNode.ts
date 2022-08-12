import { logger } from 'firebase-functions';

import { hashString, sleep, AsyncNodeStatus, NodeIdentifier, NotebookIdentifier, UserIdentifier } from '@ureeka-notebook/service-common';

import { ApplicationError } from '../util/error';
import { updateDocument } from './api/api';
import { Demo2AsyncNodeAttributeReplace } from './api/demo2AsyncNode';

// ********************************************************************************
export const executeDemo2AsyncNode = async (userId: UserIdentifier, notebookId: NotebookIdentifier, nodeId: NodeIdentifier, content: string, replace: string) => {
  // simulate a long-running operation
  let status: AsyncNodeStatus = AsyncNodeStatus.PROCESSING;
  let result: string | undefined/*error*/ = undefined/*default to error*/;
  let replacedText: string | undefined/*error*/ = undefined/*default to error*/;
  try {
    await sleep(3000/*3s*/);
    status = AsyncNodeStatus.SUCCESS;

    if(!content.includes(replace)) throw new ApplicationError('functions/invalid-argument', `Demo2AsyncNode ${nodeId} in notebook ${notebookId} does not contain '${replace}'.`);

    // produce an arbitrary result based on the specified content
    replacedText = `Previous text contained ${replace.length} characters and has a hash of '${hashString(replace)}'`;
    result = content.replace(replace, replacedText);
  } catch(error) {
    logger.error(`Error executing Demo2AsyncNode: ${error}`);
    status = AsyncNodeStatus.ERROR;
  }

  // creates a range of the replaced text
  const markStart = result ? content.indexOf(replace) : undefined/*no mark*/,
        markEnd = result && replacedText ? replacedText.length : undefined/*no mark*/;
  // update the identified Demo2AsyncNode with the result
  await updateDocument(userId, notebookId, [ new Demo2AsyncNodeAttributeReplace(nodeId, status, result, markStart, markEnd)]);
};
