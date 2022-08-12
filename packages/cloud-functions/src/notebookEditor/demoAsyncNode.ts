import { logger } from 'firebase-functions';

import { hashString, sleep, AsyncNodeStatus, NodeIdentifier, NotebookIdentifier, UserIdentifier } from '@ureeka-notebook/service-common';

import { updateDocument } from './api/api';
import { DemoAsyncNodeAttributeReplace } from './api/demoAsyncNode';

// ********************************************************************************
export const executeDemoAsyncNode = async (userId: UserIdentifier, notebookId: NotebookIdentifier, nodeId: NodeIdentifier, hashes: string[], content: string) => {
  // simulate a long-running operation
  let status: AsyncNodeStatus;
  let text: string;
  try {
    await sleep(3000/*3s*/);
    status = AsyncNodeStatus.SUCCESS;

    // produce an arbitrary result based on the specified content
    text = `Content contains ${content.length} characters and has a hash of '${hashString(content)}'`;
  } catch(error) {
    logger.error(`Error executing DemoAsyncNode: ${error}`);
    status = AsyncNodeStatus.ERROR;
    text = 'Error'/*CHECK: anything else?*/;
  }

  // update the identified DemoAsyncNode with the result
  await updateDocument(userId, notebookId, [ new DemoAsyncNodeAttributeReplace(nodeId, hashes, status, text) ]);
};
