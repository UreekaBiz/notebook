import { Editor } from '@tiptap/core';
import { Slice } from 'prosemirror-model';
import { Plugin, PluginKey } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';

import { NoPluginState } from 'notebookEditor/model/type';

import { serializeDocumentFragment } from './serialize';

// ********************************************************************************
// this Plugin implements behavior that is common to all the document

// == Plugin ======================================================================
const documentKey = new PluginKey<NoPluginState>('documentKey');
export const DocumentPlugin = (editor: Editor) => {
  const plugin = new Plugin<NoPluginState>({
    // -- Setup -------------------------------------------------------------------
    key: documentKey,

    // -- Props -------------------------------------------------------------------
    props: {
      // REF: https://discuss.prosemirror.net/t/disable-ctrl-click/995/2
      // NOTE: prevents the default parent Node selection behavior
      //      from being triggered when either the CMD or the CTRL keys are pressed.
      //      This default behavior comes from PM (SEE: REF above)
      handleClick(view: EditorView, pos: number, event: MouseEvent) {
        if(event.ctrlKey || event.metaKey) return true/*(SEE: comment above)*/;

        return false/*allow regular event handling*/;
      },

      // define custom clipboard Text representations for Nodes
      clipboardTextSerializer: (slice: Slice) => serializeDocumentFragment(editor, slice.content),
    },
  });

  return plugin;
};
