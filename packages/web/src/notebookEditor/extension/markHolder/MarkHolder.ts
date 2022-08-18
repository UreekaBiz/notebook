import { Node } from '@tiptap/core';

import { getNodeOutputSpec, storedMarksFromDOM, AttributeType, MarkHolderNodeSpec, NodeName } from '@ureeka-notebook/web-service';

import { NoOptions, NoStorage, ParseRulePriority } from 'notebookEditor/model/type';

import { MarkHolderPlugin } from './plugin';

// ********************************************************************************
// == Node ========================================================================
export const MarkHolder = Node.create<NoOptions, NoStorage>({
  ...MarkHolderNodeSpec,

  // -- Attribute -----------------------------------------------------------------
  // NOTE: custom parseHTML being used to correctly parse the Mark array of the
  //       MarkHolder
  addAttributes() {
    return {
      [AttributeType.StoredMarks]: {
        default: '[]'/*empty array*/,

        // parse the stored marks from the copied HTML
        // SEE: MarkHolderNodeRendererSpec
        parseHTML: (element): string => {
          const attributeStoredMarks = element.getAttribute(AttributeType.StoredMarks);
          if(!attributeStoredMarks) return '[]'/*empty array*/;

          const stringifiedJSONMarksArray = storedMarksFromDOM(attributeStoredMarks)/*(SEE: markHolder.ts)*/;
          return stringifiedJSONMarksArray;
        },
      },
    };
  },

  // -- Plugin --------------------------------------------------------------------
  addProseMirrorPlugins() { return [ MarkHolderPlugin() ]; },

  // -- View ----------------------------------------------------------------------
  parseHTML() { return [{
    tag: `div[data-node-type="${NodeName.MARK_HOLDER}"]`,
    priority: ParseRulePriority.MARK_HOLDER, /*(SEE: ParseRulePriority)*/
  }];
},
  renderHTML({ node, HTMLAttributes }) { return getNodeOutputSpec(node, HTMLAttributes, true/*is Leaf Node*/); },
});
