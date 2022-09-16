import { Node } from '@tiptap/core';
import Router from 'next/router';

import { getSelectedNode, AttributeType, DocumentNodeSpec } from '@ureeka-notebook/web-service';

import { NoOptions, NoStorage } from 'notebookEditor/model/type';

import { DocumentPlugin } from './plugin';

// ********************************************************************************
// REF: https://github.com/ueberdosis/tiptap/blob/main/packages/extension-document/src/document.ts

// == Node ========================================================================
export const Document = Node.create<NoOptions, NoStorage>({
  ...DocumentNodeSpec,

  // -- Plugin --------------------------------------------------------------------
  addProseMirrorPlugins() { return [DocumentPlugin(this.editor)]; },

  // -- Keyboard Shortcut ---------------------------------------------------------
  // REF: https://prosemirror.net/docs/ref/#commands.pcBaseKeymap
  // NOTE: the default behavior for Mod-Enter (SEE: REF above) is to call
  //       exitCode() (which inserts a Paragraph below when the Selection is in a
  //       Node with the code prop in its Spec set to true. Since this behavior has
  //       been customized to Shift-Enter, reserving Cmd-Enter for execution of
  //       other Nodes at a Document level, return true
  //       (preventing the default behavior)
  addKeyboardShortcuts() { return { 'Mod-Enter': () => true/*do not let PM handle the shortcut*/ }; },

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
});
