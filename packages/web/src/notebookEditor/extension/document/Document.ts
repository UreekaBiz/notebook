import { Node } from '@tiptap/core';
import { Plugin } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';

import { DocumentNodeSpec, NotebookSchemaType } from '@ureeka-notebook/web-service';

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
});
