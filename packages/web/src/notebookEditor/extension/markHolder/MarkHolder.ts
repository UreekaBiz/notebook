import { Node } from '@tiptap/core';
import { Mark } from 'prosemirror-model';

import { getNodeOutputSpec, AttributeType, JSONMark, MarkHolderNodeSpec, NodeName, SchemaV2 } from '@ureeka-notebook/service-common';

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
        default: [/*empty*/],

        // Parse the stored marks from the copied HTML.
        // SEE: MarkHolderNodeRendererSpec
        parseHTML: (element): Mark[] => {
          const stringifiedArray = element.getAttribute(AttributeType.StoredMarks);
          if(!stringifiedArray) return [/*default empty*/];

          const JSONMarks = JSON.parse(stringifiedArray.replaceAll("'", "\"")/*(SEE: markHolder.ts)*/) as JSONMark[]/*by contract*/;

          // Convert the JSONMarks into ProseMirror Marks
          const markArray: Mark[] = JSONMarks.map(markName => Mark.fromJSON(SchemaV2, markName));
          return markArray;
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

