import { Node } from '@tiptap/core';
import Router from 'next/router';

import { getSelectedNode, isHeadingNode, AttributeType, DocumentNodeSpec } from '@ureeka-notebook/web-service';

import { NoOptions, NoStorage } from 'notebookEditor/model/type';

import { documentPlugin } from './plugin';

// ********************************************************************************
// == Node ========================================================================
export const Document = Node.create<NoOptions, NoStorage>({
  ...DocumentNodeSpec,

  // -- Update --------------------------------------------------------------------
  // ensure the URL receives the current notebookId plus the Id of the nearest
  // Heading above the current Selection's anchor if it exists, or gets cleaned
  // up if there are no Headings
  onSelectionUpdate() {
    const { doc, selection } = this.editor.state;
    let node = getSelectedNode(this.editor.state);
    if(!node) {
      node = selection.$anchor.parent;
    } /* else -- in a NodeSelection (no need to check for parent). Get its Id */

    let nodeId = node.attrs[AttributeType.Id];
    if(!nodeId) {
      // find the nearest Heading above and get its Id by looking through the
      // direct children of the Document
      let nearestPos = 0/*default*/;
      for(let i=0; i<doc.childCount; i++) {
        const childAtIndex = doc.child(i);
        if(childAtIndex && isHeadingNode(childAtIndex)) {
          const pos = selection.$anchor.posAtIndex(i, 0/*direct child of Doc*/);
          if((pos >= nearestPos/*closest*/) && (pos < selection.anchor/*above current Selection anchor*/) ) {
            nearestPos = pos;
            nodeId = childAtIndex.attrs[AttributeType.Id];
          } /* else -- not the closest Heading above, ignore */
        } /* else -- not a Heading, ignore */
      }
    }

    // REF: https://developer.mozilla.org/en-US/docs/Web/API/History/replaceState
    // NOTE: using window.history since there is no need to interact with NextJS
    //       other than to get the notebookId
    const { notebookId } = Router.query;
    if(!notebookId) return/*nothing to do*/;

    if(!nodeId) { window.history.replaceState(undefined/*no data*/, ''/*(SEE: REF above)*/, `${notebookId}`); }
    else { window.history.replaceState(undefined/*no data*/, ''/*(SEE: REF above)*/, `${notebookId}#${nodeId}`); }
  },

  // -- Plugin --------------------------------------------------------------------
  addProseMirrorPlugins() { return [documentPlugin(this.editor)]; },
});
