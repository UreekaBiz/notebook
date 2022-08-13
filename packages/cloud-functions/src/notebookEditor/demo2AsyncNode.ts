import { logger } from 'firebase-functions';

import { createEditorState, findNodeById, hashString, isDemo2AsyncNode, sleep, AsyncNodeStatus, MarkName, NodeIdentifier, NotebookIdentifier, UserIdentifier } from '@ureeka-notebook/service-common';

import { ApplicationError } from '../util/error';
import { getDocument, updateDocument } from './api/api';
import { Demo2AsyncNodeAttributeReplace } from './api/demo2AsyncNode';
import { AddMark } from './api/mark';
import { InsertText } from './api/text';
import { DocumentUpdate } from './api/type';

// ********************************************************************************
export const executeDemo2AsyncNode = async (userId: UserIdentifier, notebookId: NotebookIdentifier, nodeId: NodeIdentifier, content: string, replace: string) => {
  // simulate a long-running operation
  let status: AsyncNodeStatus = AsyncNodeStatus.PROCESSING;
  let replacedText: string | undefined/*error*/ = undefined/*default to error*/;
  try {
    await sleep(3000/*3s*/);
    status = AsyncNodeStatus.SUCCESS;

    if(!content.includes(replace)) throw new ApplicationError('functions/invalid-argument', `Demo2AsyncNode ${nodeId} in notebook ${notebookId} does not contain '${replace}'.`);

    // produce an arbitrary result based on the specified content
    replacedText = `Previous text contained ${replace.length} characters and has a hash of '${hashString(replace)}'`;
  } catch(error) {
    logger.error(`Error executing Demo2AsyncNode: ${error}`);
    status = AsyncNodeStatus.ERROR;
  }

  // update the node with the result
  updateNode(userId, notebookId, nodeId, content, replace, status, replacedText);
};

// ................................................................................
const updateNode = async (
  userId: UserIdentifier,
  notebookId: NotebookIdentifier, nodeId: NodeIdentifier, content: string, replace: string,
  status: AsyncNodeStatus, replacedText?: string
) => {
  const { document, schemaVersion } = await getDocument(userId, notebookId);
  const editorState = createEditorState(schemaVersion, document);

  // get the Demo 2 Async Node for the given Node Identifier
  const result = findNodeById(editorState, nodeId);
  if(!result) throw new ApplicationError('functions/not-found', `Cannot find Demo 2 Async Node (${nodeId}).`);
  const { node, position } = result;
  if(!isDemo2AsyncNode(node)) throw new ApplicationError('functions/invalid-argument', `Node (${nodeId}) is not a Demo 2 Async Node.`);

  // update status attribute
  const updates: DocumentUpdate[] = [ new Demo2AsyncNodeAttributeReplace(nodeId, status) ];

  // wrap the replaced text in a mark if it was successful
  if(status === AsyncNodeStatus.SUCCESS && replacedText){
    const textStart = position + 1/*start of node*/ + content.indexOf(replace),
          textEnd = textStart + replace.length;

    // replaces text with result
    updates.push(new InsertText(replacedText, textStart, textEnd));

    // creates a range of the replaced text
    const markStart = textStart,
          markEnd = markStart + replacedText.length;
    updates.push(new AddMark(MarkName.REPLACED_TEXT_MARK, markStart, markEnd));
  } else {
    // replaces D2AN text with error message
    updates.push(new InsertText(`Error`, position + 1/*start of node*/, node.content.size));
  }

  // update the identified Demo2AsyncNode with the result
  await updateDocument(userId, notebookId, updates);
};
