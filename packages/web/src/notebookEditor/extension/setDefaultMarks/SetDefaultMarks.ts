import { Extension } from '@tiptap/core';
import { Plugin } from 'prosemirror-state';

import { findContentDifferencePositions, getNodeName, MarkName, NodeName } from '@ureeka-notebook/web-service';

import { ExtensionName, ExtensionPriority } from 'notebookEditor/model/type';

// ********************************************************************************
// ================================================================================
// the set of Node 'types' that are to be checked for initial default marks, as
// well as the default marks that they receive on creation
const includedNodes = new Map<NodeName, MarkName[]>([[NodeName.HEADING, [MarkName.BOLD]]]);

// ********************************************************************************
/**
 * This extension ensures that nodes that are in the inclusion set and that have an
 * (required for this extension to work) 'initialMarksSet' boolean attribute
 * receive a default set of marks on creation (that specifically get applied after
 * the first textContent has been inserted into them)
 */
export const SetDefaultMarks = Extension.create({
  name: ExtensionName.SET_DEFAULT_MARKS/*Expected and guaranteed to be unique*/,
  priority: ExtensionPriority.SET_DEFAULT_MARKS,

  // -- Plugin --------------------------------------------------------------------
  addProseMirrorPlugins() {
    return [
      new Plugin({
        // -- Transaction -------------------------------------------------------------
        // Ensure the given node has the default set of marks at creation
        // NOTE: Requires that the node has an 'initialMarksSet' attribute
        // NOTE: If the whole doc content changes (e.g. the whole doc is set to be
        //       a heading) the complexity is O(docSize). Otherwise its O(nodesChanged)
        //       the regular case is that nodesChanged includes the text node where the
        //       change occurred and the paragraph node that contains it, i.e. O(2)
        appendTransaction(transactions, oldState, newState) { /*called on every keypress, action, etc*/
          if(newState.doc === oldState.doc) return/*no changes*/;
          const { tr } = newState;

          const contentDifferencePositions = findContentDifferencePositions(oldState.doc, newState.doc);
          if(!contentDifferencePositions) return;

          // a is the difference position location in the previous doc, b in the new one
          // use b since the changed nodes will be looked for in the new state
          const { docsDifferenceStart, docDifferenceEnds } = contentDifferencePositions,
            { b: newDocDifferenceEnd } = docDifferenceEnds;

          // look for nodes across the doc in the range where the content changed
          newState.doc.nodesBetween(docsDifferenceStart, newDocDifferenceEnd, (node, nodePos) => {
            const nodeName = getNodeName(node);
            const includedNodeMarks = includedNodes.get(nodeName);
            if(includedNodeMarks && node.textContent !== '' && node.attrs.initialMarksSet === false) {
              includedNodeMarks.forEach(markName => {
                tr.addMark(nodePos, nodePos + node.nodeSize, newState.schema.marks[markName].create());
                tr.setNodeMarkup(nodePos, node.type, { ...node.attrs, initialMarksSet: true });
              });
            } /* else -- node does not need to be modified, do nothing */
          });

          return tr;
        },
      }),
    ];
  },
});
