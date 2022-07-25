import { ParentConfig } from '@tiptap/core';

import { ExtensionName } from 'notebookEditor/model/type';

// ********************************************************************************
// == Type ========================================================================
// NOTE: Usage of ambient module to ensure command is TypeScript-registered
declare module '@tiptap/core' {
  interface NodeConfig<Options, Storage> {
    /** Allow gap cursor */
    [ExtensionName.GAP_CURSOR_ALLOW]?:
      | boolean
      | null
      | ((this: {
          name: string;
          options: Options;
          storage: Storage;
          parent: ParentConfig<NodeConfig<Options>>[ExtensionName.GAP_CURSOR_ALLOW];
        }) => boolean | null);
  }
}
