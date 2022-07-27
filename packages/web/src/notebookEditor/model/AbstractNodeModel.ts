import { Editor } from '@tiptap/core';
import { Node as ProseMirrorNode } from 'prosemirror-model';

import { getPosType, isGetPos } from 'notebookEditor/extension/util/node';

import { NodeViewStorage } from './NodeViewStorage';
import { AbstractNodeController } from './AbstractNodeController';

// Abstract class that holds the model for a NodeController. The implementation of
// the model is left to the subclasses.
// SEE: AbstractNodeController
// ********************************************************************************
export abstract class AbstractNodeModel<NodeType extends ProseMirrorNode, Storage extends NodeViewStorage<AbstractNodeController<NodeType, any, any, any>>> {
  public readonly editor: Editor;
  public readonly storage: Storage;
  public node: NodeType;
  public readonly getPos: (() => number);

  // == Life-Cycle ================================================================
  public constructor(editor: Editor, node: NodeType, storage: Storage, getPos: getPosType) {
    if(!isGetPos(getPos)) throw new Error('getPos is not a function when creating an AbstractNodeController');

    this.editor = editor;
    this.storage = storage;
    this.node = node;
    this.getPos = getPos;
  }
}
