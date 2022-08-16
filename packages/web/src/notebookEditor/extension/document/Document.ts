import { Node } from '@tiptap/core';
import { Plugin } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import Router from 'next/router';

import { getSelectedNode, AttributeType, DocumentNodeSpec, NotebookSchemaType } from '@ureeka-notebook/web-service';

import { NoOptions, NoStorage } from 'notebookEditor/model/type';

// ********************************************************************************
// REF: https://github.com/ueberdosis/tiptap/blob/main/packages/extension-document/src/document.ts

// == Node ========================================================================
export const Document = Node.create<NoOptions, NoStorage>({
  ...DocumentNodeSpec,

  // -- Plugin --------------------------------------------------------------------
  // REF: https://discuss.prosemirror.net/t/disable-ctrl-click/995/2
  // NOTE: this Plugin prevents the default parent Node selection behavior
  //      from being triggered when either the CMD or the CTRL keys are pressed.
  //      This default behavior comes from PM (SEE: REF above)
  addProseMirrorPlugins() {
    return [
      new Plugin<NotebookSchemaType>({
        props: {
          handleClick(view: EditorView, pos: number, event: MouseEvent) {
            if(event.ctrlKey || event.metaKey) return true/*(SEE: comment above)*/;

            return false/*allow regular event handling*/;
          },
        },
      }),
    ];
  },

  // -- Update --------------------------------------------------------------------
  // update the Route of the browser so that it gets the Id of the currently
  // selected Node if any, otherwise do nothing
  onSelectionUpdate() {
    let node = getSelectedNode(this.editor.state);
    if(!node) {
      node = this.editor.state.selection.$anchor.parent;
    } /* else -- in a NodeSelection, get its Id */

    const nodeId = node.attrs[AttributeType.Id];
    if(!nodeId) return/*nothing to do*/;

    // FIXME: Cancel rendering route
    // Router.replace(
    //   {
    //     pathname: Router.pathname/*keep same path*/,
    //     query: { ...Router.query }/*keep same query*/,
    //   },

    //   // update route (masking the url for the browser)
    //   `${Router.query.notebookId}#${nodeId}`,

    //   { shallow: true/*do not re-run NextJS methods*/ }
    // );
  },
});
