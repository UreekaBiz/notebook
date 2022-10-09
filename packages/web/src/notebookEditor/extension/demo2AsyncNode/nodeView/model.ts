import { AsyncNodeStatus, Demo2AsyncNodeType, AttributeType } from '@ureeka-notebook/web-service';

import { AbstractAsyncNodeModel } from 'notebookEditor/extension/asyncNode/nodeView/model';

import { asyncReplaceDemo2AsyncNodeContentCommand } from '../command';
import { Demo2AsyncNodeStorageType } from './controller';

// ********************************************************************************
export class Demo2AsyncNodeModel extends AbstractAsyncNodeModel<string, Demo2AsyncNodeType, Demo2AsyncNodeStorageType> {
  // == Abstract Methods ==========================================================
  // creates a promise that returns a random string after 2 seconds
  protected createPromise() {
    return new Promise<string>((resolve) => {
      const length = Math.floor(Math.random() * (100/*T&E*/) + 1);
      const string = createRandomString(length);
      const delay = this.node.attrs[AttributeType.Delay] ?? 0/*default*/;
      setTimeout(() => resolve(string), delay);
    });
  }

  /** Replaces the first instance of the text to be replaced with the replacement
   * text and wrap it around a {@link ReplacedTextMark}. */
  // NOTE: this works with the content at the moment this function finished its
  //       execution, not when it's first called.
  public async executeAsyncCall(): Promise<boolean> {
    try {
      const textContent = this.node.textContent,
            textToReplace = this.node.attrs[AttributeType.TextToReplace];

      // get the result from the promise
      const result = await this.createPromise();

      // replace the Text and wrap it around the Mark
      asyncReplaceDemo2AsyncNodeContentCommand(this.getPos(), textContent, textToReplace, result)(this.editor.state, this.editor.view.dispatch);
    } catch(error) {
      // node got deleted while performing the replacement call
      console.warn(error);
      return false/*view not updated*/;
    }
    return true/*view updated*/;
  }

  protected getStatusFromResult(result: string) {
    return AsyncNodeStatus.SUCCESS/*default for D2AN*/;
  }

  public isAsyncNodeDirty(): boolean {
    // TODO: discuss and implement the conditions for a Demo2AsyncNode
    //        to be considered dirty
    return false;
  }
}

// == Util ==============================================================================
// -- Promise ---------------------------------------------------------------------------
const randomStringChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
const createRandomString = (length: number) => {
  let result = '';
  for( let i = 0; i < length; i++ ) {
    result += randomStringChars.charAt(Math.floor(Math.random() * randomStringChars.length));
  }
  return result;
};
