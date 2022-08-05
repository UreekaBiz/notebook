import { Editor } from '@tiptap/core';

import { NodeIdentifier, NodeName, VisualIdMap } from '@ureeka-notebook/web-service';

import { NodeViewStorage } from 'notebookEditor/model/NodeViewStorage';
import { computeState } from 'notebookEditor/shared/state';

import { VisualId } from '../type';
import { CodeBlockController } from './controller';

// ********************************************************************************
// == Storage =====================================================================
export class CodeBlockStorage extends NodeViewStorage<CodeBlockController> {
  // The visualId indicates the position of the CodeBlock relative to Headings and
  // other CodeBlocks that are present in the Editor, and its displayed to the
  // right of the content container in the CodeBlockController.
  private visualIdMap: VisualIdMap;

  // -- Life-cycle ----------------------------------------------------------------
  constructor() {
    super();

    this.visualIdMap = {/*empty map by contract*/};
  }

  // -- Visual Ids ----------------------------------------------------------------
  public updateVisualIds(editor: Editor) {
    const codeBlockState = computeState(editor)[NodeName.CODEBLOCK];
    this.visualIdMap = codeBlockState.visualIds;
  }

  public getVisualId(id: NodeIdentifier): VisualId {
    return this.visualIdMap[id];
  }

  public getCodeBlockId(searchedVisualId: string): NodeIdentifier | undefined {
    return Object.keys(this.visualIdMap).find(codeBlockId => this.visualIdMap[codeBlockId] === searchedVisualId);
  }
}
export const getCodeBlockViewStorage = (editor: Editor): CodeBlockStorage => {
  const storage = editor.storage[NodeName.CODEBLOCK];
  if(!isCodeBlockViewStorage(storage)) throw new Error('Incorrect type of storage for codeBlock');
  return storage;
};
const isCodeBlockViewStorage = (storage: any): storage is CodeBlockStorage => 'visualIdMap' in storage;
