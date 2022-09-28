import { DialogStorageInterface } from 'notebookEditor/model/DialogStorage';
import { NodeViewStorage } from 'notebookEditor/model/NodeViewStorage';

import { ImageController } from './controller';

// ********************************************************************************
// == Storage =====================================================================
export class ImageStorage extends NodeViewStorage<ImageController> implements DialogStorageInterface {
  // -- Attribute -----------------------------------------------------------------
  // When set to true, a dialog prompting the user for the image URL appears
  // SEE: EditorUserInteractions.tsx
  private shouldInsertNodeOrMark: boolean;

  // -- Life Cycle ----------------------------------------------------------------
  constructor() {
    super();
    this.shouldInsertNodeOrMark = false/*default*/;
  }

  public getShouldInsertNodeOrMark() { return this.shouldInsertNodeOrMark; }
  public setShouldInsertNodeOrMark(value: boolean) { this.shouldInsertNodeOrMark = value; }
}
