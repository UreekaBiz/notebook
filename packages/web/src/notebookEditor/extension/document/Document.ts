import { Node } from '@tiptap/core';
import Router from 'next/router';

import { getSelectedNode, AttributeType, DocumentNodeSpec } from '@ureeka-notebook/web-service';

import { NoOptions, NoStorage } from 'notebookEditor/model/type';

import { documentPlugin } from './plugin';

// ********************************************************************************
// REF: https://github.com/ueberdosis/tiptap/blob/main/packages/extension-document/src/document.ts

// == Node ========================================================================
export const Document = Node.create<NoOptions, NoStorage>({
  ...DocumentNodeSpec,

  // -- Update --------------------------------------------------------------------
  onSelectionUpdate() {
    let node = getSelectedNode(this.editor.state);
    if(!node) {
      node = this.editor.state.selection.$anchor.parent;
    } /* else -- in a NodeSelection (no need to check for parent). Get its Id */

    const nodeId = node.attrs[AttributeType.Id];
    if(!nodeId) return/*nothing to do*/;

    // REF: https://developer.mozilla.org/en-US/docs/Web/API/History/replaceState
    // NOTE: using window.history since there is no need to interact with NextJS
    //       other than to get the notebookId
    const { notebookId } = Router.query;
    if(!notebookId) return/*nothing to do*/;

    window.history.replaceState(undefined/*no data*/, ''/*(SEE: REF above)*/, `${notebookId}#${nodeId}`);
  },

  // -- Plugin --------------------------------------------------------------------
  addProseMirrorPlugins() { return [documentPlugin(this.editor)]; },
});
