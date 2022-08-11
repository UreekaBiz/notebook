import { logger } from 'firebase-functions';

import { hashString, sleep, NodeIdentifier, NotebookIdentifier, UserIdentifier, AsyncNodeStatus } from '@ureeka-notebook/service-common';

import { updateDocument } from './api/api';
import { DemoAsyncNodeAttributeReplace } from './api/demoAsyncNode';

// ********************************************************************************
export const executeDemoAsyncNode = async (userId: UserIdentifier, notebookId: NotebookIdentifier, nodeId: NodeIdentifier, hashes: string[], content: string) => {
  // simulate a long-running operation
  let status: AsyncNodeStatus = AsyncNodeStatus.PROCESSING;
  let text: string | undefined/*error*/ = undefined/*default to error*/;
  try {
    await sleep(3000/*3s*/);
    status = AsyncNodeStatus.SUCCESS;

    // produce an arbitrary result based on the specified content
    text = `Content contains ${content.length} characters and has a hash of '${hashString(content)}'`;
  } catch(error) {
    logger.error(`Error executing Demo3AsyncNode: ${error}`);
    status = AsyncNodeStatus.ERROR;
  }

  // update the identified Demo3AsyncNode with the result
  await updateDocument(userId, notebookId, [ new DemoAsyncNodeAttributeReplace(nodeId, status, hashes, text) ]);
};
