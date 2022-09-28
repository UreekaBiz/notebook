import { Editor } from '@tiptap/core';

import { MarkName, NodeName } from '@ureeka-notebook/web-service';

// storage exists for the life-time of the editor (regardless of whether
// or not any nodes or marks exist or have ever existed). Its primary function is
// to simplify communication with React through the editor storage functionality.
// For example, triggering a dialog when the user clicks on the add image button

// NOTE: This is meant to be used as a general storage type for extensions, nodes
//       or marks that must trigger a Dialog as part of their functionality, but
//       don't require a whole NodeViewStorage or more complexity (e.g.
//       images or links). If the extension, node or mark requires more complex
//       storage and must also show dialogs then it is recommended to add said
//       state to create a custom storage for the extension, node or mark
// ********************************************************************************
// == Interface ===================================================================
export interface DialogStorageInterface {
  getShouldInsertNodeOrMark: () => boolean;
  setShouldInsertNodeOrMark: (value: boolean) => void;
}

// == Class =======================================================================
export class DialogStorage implements DialogStorageInterface {
  // -- Attribute -----------------------------------------------------------------
  // When set to true, a dialog prompting the user for the image URL appears
  // SEE: EditorUserInteractions.tsx
  private shouldInsertNodeOrMark: boolean;

  // -- Life Cycle ----------------------------------------------------------------
  constructor() { this.shouldInsertNodeOrMark = false/*default*/; }

  public getShouldInsertNodeOrMark() { return this.shouldInsertNodeOrMark; }
  public setShouldInsertNodeOrMark(value: boolean) { this.shouldInsertNodeOrMark = value; }
}

// == Util ========================================================================
export const getDialogStorage = (editor: Editor | null/*not created yet*/, name: NodeName | MarkName) => {
  if(!editor) return undefined;

  const storage = editor.storage[name];
  if(!isDialogStorage(storage)) throw new Error(`Wrong kind of storage for ${name} storage`);

  return storage;
};
const isDialogStorage = (storage: any): storage is DialogStorage => 'shouldInsertNodeOrMark' in storage;
