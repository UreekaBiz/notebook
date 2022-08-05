import { Extension } from '@tiptap/core';
import { Node as ProsemirrorNode } from 'prosemirror-model';
import { Plugin } from 'prosemirror-state';

import { generateNodeId, AttributeType, NodeName } from '@ureeka-notebook/web-service';

import { resolveNewSelection } from 'notebookEditor/extension/util/node';
import { ExtensionName, ExtensionPriority } from 'notebookEditor/model/type';

// ********************************************************************************
export const DEFAULT_NODE_ID = 'Default';

// ================================================================================
// the set of Node 'types' that are to be checked for IDs (the 'inclusion set')
const includedNodes: Set<string> = new Set([NodeName.CODEBLOCK, NodeName.DEMO_ASYNCNODE, NodeName.DEMO_2_ASYNC_NODE, NodeName.HEADING, NodeName.IMAGE]);

// is the specified Node in the inclusion set?
const isUuidNode = (node: ProsemirrorNode<any>) =>
  node.attrs[AttributeType.Id] && (typeof node.attrs[AttributeType.Id] === 'string') && includedNodes.has(node.type.name);

// ********************************************************************************
/**
 * This extension prevents nodes with the same ID from existing which can occur
 * when copying and pasting nodes. This also changes the ID of a node if it contains
 * {@link DEFAULT_NODE_ID}.
 */
// REF: https://github.com/ueberdosis/tiptap/issues/1041
// REF: https://github.com/ueberdosis/tiptap/issues/252
// REF: https://github.com/ueberdosis/tiptap/blob/ed56337470efb4fd277128ab7ef792b37cfae992/packages/core/src/extensions/keymap.ts
export const UniqueNodeId = Extension.create({
  name: ExtensionName.UNIQUE_NODE_ID/*Expected and guaranteed to be unique*/,
  priority: ExtensionPriority.UNIQUE_NODE_ID,

  // -- Plugin --------------------------------------------------------------------
  addProseMirrorPlugins() {
    return [
      new Plugin({
        // -- Transaction ---------------------------------------------------------
        // Ensures there are no nodes with duplicate ids (e.g. during copy-paste operations)
        appendTransaction: (_transactions, oldState, newState) => {
          if(newState.doc === oldState.doc) return/*no changes*/;
          const { tr } = newState/*for convenience*/,
                { selection: initialSelection } = tr;

          // for Nodes in the inclusion set:
          // 1. if their id includes the default then replace with a new UUID
          // 2. if their id has already been seen then replace with a new UUID
          // 3. if their id has never been seen then the Node id remains
          const knownIds = new Set<string>();
          newState.doc.descendants((node, pos) => {
            if(!isUuidNode(node)) return/*not in the inclusion set*/;

            // NOTE: adding any new id to the known set is overkill but is done for completeness
            const id = node.attrs[AttributeType.Id] as string/*confirmed by 'type guard' above*/;
            if(id.includes(DEFAULT_NODE_ID)/*case #1*/ || knownIds.has(id)/*case #2*/) {
              const newId = generateNodeId();
              tr.setNodeMarkup(pos, undefined/*preserve existing type*/, { ...node.attrs, id: newId });
              knownIds.add(newId);
            } else { /*case #3*/
              knownIds.add(id);
            }
          });

          tr.setSelection(resolveNewSelection(initialSelection, tr))/*set selection to where it was*/;
          return tr;
        },
      }),
    ];
  },
});
