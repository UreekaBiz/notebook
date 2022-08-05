import { Editor } from '@tiptap/core';

import { AttributeType, CodeBlockAsyncNodeType, isCodeBlockAsyncNode } from '@ureeka-notebook/web-service';

import { AbstractAsyncNodeModel } from 'notebookEditor/extension/asyncNode/nodeView/model';
import { getCodeBlockViewStorage } from 'notebookEditor/extension/codeblock/nodeView/storage';
import { codeBlockHash, hashesFromCodeBlockReferences } from 'notebookEditor/extension/codeBlockAsyncNode/util';
import { getPosType } from 'notebookEditor/extension/util/node';

import { AbstractCodeBlockAsyncNodeStorageType } from './controller';

// ********************************************************************************
export abstract class AbstractCodeBlockAsyncNodeModel

  // .. AbstractCodeBlockAsyncNodeModel Generics ....................................
  <T/*value returned by the async function*/,
  NodeType extends CodeBlockAsyncNodeType,
  Storage extends AbstractCodeBlockAsyncNodeStorageType>

  // .. AbstractAsyncNodeModel Generics ...........................................
  extends AbstractAsyncNodeModel<T, NodeType, Storage> {

  // == Lifecycle =================================================================
  public constructor(editor: Editor, node: NodeType, storage: Storage, getPos: getPosType) {
    super(editor, node, storage, getPos);
    // currently no additional behavior
  }

  // ================================================================================
  // all codeBlockAsyncNodes have the following functionality in common
  public async executeAsyncCall() {
    // NOTE: Hashes must be computed before the async call is executed, because the
    //       code blocks can change during the async call.
    const hashes = hashesFromCodeBlockReferences(this.editor, this.node.attrs.codeBlockReferences);

    const result = await this.createPromise();

    // if the Node that initiated the async call no longer exists by the time
    // the async call resolves, PM handles the removal of all of its view
    // components and syncs the Editor state. Hence the only thing that must
    // be done is to -not- make the replacement call by returning false from the
    // executeAsyncCall that had been scheduled previously
    if(!this.getPos() || !isCodeBlockAsyncNode(this.node)) {
      return false/*node view not updated*/;
    } /* else -- node still exists */

    // get the status based on the implementation of the AbstractAsyncNodeView
    const status = this.getStatusFromResult(result);
    const node = this.node.copy() as CodeBlockAsyncNodeType/*guaranteed by above check*/;
          node.attrs[AttributeType.CodeBlockHashes] = hashes;
          node.attrs[AttributeType.Status] = status;
          // FIXME: Is this correct? What happens if the result is cannot be stringified?
          node.attrs[AttributeType.Text] = String(result);

    const viewWasUpdated = this.replaceCodeBlockAsyncNode(this.editor, node, this.getPos());
    return viewWasUpdated;
  }

  // All codeBlockAsyncNodes share this logic for checking if they are dirty
  // (SEE: checkDirty.ts)
  public isAsyncNodeDirty() {
    const { codeBlockReferences, codeBlockHashes } = this.node.attrs,
          codeBlockViewStorage = getCodeBlockViewStorage(this.editor);

    let isDirty = false/*default*/;
    if(codeBlockReferences.length !== codeBlockHashes.length) {
      isDirty = true;
    }/* else -- do not change default */

    for(let j=0; j<codeBlockReferences.length; j++) {
      // -- check if node is not dirty already ------------------------------------
      if(isDirty) {
        break/*already know node is dirty*/;
      }/* else -- same amount of references and hashes */

      // -- check that codeBlock exists -----------------------------------------
      const referencedCodeBlockView = codeBlockViewStorage.getNodeView(codeBlockReferences[j]);
      if(!referencedCodeBlockView) {
        isDirty = true/*reference no longer exists*/;
        break/*nothing else to check*/;
      }/* else -- reference still exists */

      // -- check that hash matches ---------------------------------------------
      if(codeBlockHash(referencedCodeBlockView.node) !== codeBlockHashes[j]) {
        isDirty = true/*order of hashes is different or content changed*/;
        break/*nothing else to check*/;
      }/* else -- hash matches, node is not dirty */
    }

    return isDirty;
  }

  // ================================================================================
  /**
   * @param editor the current {@link Editor} document
   * @param node the new codeBlockAsyncNode that will replace the current one
   * @param position the position of the codeBlockAsyncNode that will be replaced
   * @returns a boolean indicating whether or not the replacement was successful
   */
  protected abstract replaceCodeBlockAsyncNode(editor: Editor, node: CodeBlockAsyncNodeType, position: number): boolean;

}
