import { Editor } from '@tiptap/core';

import { AsyncNodeStatus, CodeBlockAsyncNodeType, DemoAsyncNodeType } from '@ureeka-notebook/web-service';

import { AbstractCodeBlockAsyncNodeModel } from 'notebookEditor/extension/codeBlockAsyncNode/nodeView/model';
import { replaceInlineCodeBlockAsyncNode } from 'notebookEditor/extension/codeBlockAsyncNode/util';

import { DemoAsyncNodeStorageType } from './controller';

// ********************************************************************************
export class DemoAsyncNodeModel extends AbstractCodeBlockAsyncNodeModel<string, DemoAsyncNodeType, DemoAsyncNodeStorageType> {
  // == Abstract Methods ==========================================================
  // Returns the actual promise that gets the value to be rendered by the node and
  // will be executed by the executeAsyncCall method.
  protected createPromise() {
    try {
      const chance = Math.random(),
            log = `${chance < 0.25 ? 'Failure' : 'Success'}: The current time is ${new Date().toISOString()}`;

      return new Promise<string>(resolve => setTimeout(() => resolve(log), this.node.attrs.delay));
    } catch(error) {
      return `Failure: The current time is ${new Date().toISOString()}`;
    }
  }

  // Computes a state based on the result given by createPromise.
  protected getStatusFromResult(result: string) {
    if(typeof result !== 'string') throw new Error('Invalid result for DemoAsyncNodeView getStatusFromResult');
    const newStatus = result.includes('Failure:') ? AsyncNodeStatus.ERROR : AsyncNodeStatus.SUCCESS;
    return newStatus;
  }

  protected replaceCodeBlockAsyncNode(editor: Editor, node: CodeBlockAsyncNodeType, position: number): boolean {
    // Replace the codeBlockAsyncNode with a new one with the updated attributes
    return replaceInlineCodeBlockAsyncNode(editor, node, position);
  }
}
