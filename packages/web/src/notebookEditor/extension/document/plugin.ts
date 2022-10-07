import { Editor } from '@tiptap/core';
import { Slice } from 'prosemirror-model';
import { Plugin, PluginKey } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';

import { NoPluginState } from 'notebookEditor/model/type';

import { serializeDocumentFragment } from '../document/serialize';

// ********************************************************************************
// this Plugin implements behavior that is common to all the Document.
// Its priority order of appearance must be low or unspecified (default is 100),
// (SEE: ExtensionPriority) so that it does not interfere with the functionality
// of other Extensions or Plugins.

// == Plugin ======================================================================
const documentPluginKey = new PluginKey<NoPluginState>('documentPluginKey');
export const documentPlugin = (editor: Editor) =>
  new Plugin<NoPluginState>({
    // -- Setup -------------------------------------------------------------------
    key: documentPluginKey,

    // -- Props -------------------------------------------------------------------
    props: {
      // REF: https://discuss.prosemirror.net/t/disable-ctrl-click/995/2
      // NOTE: prevents the default parent Node selection behavior
      //       from being triggered when either the CMD or the CTRL keys are pressed.
      //       This default behavior comes from PM (SEE: REF above)
      handleClick(view: EditorView, pos: number, event: MouseEvent) {
        if(event.ctrlKey || event.metaKey) return true/*(SEE: comment above)*/;

        return false/*allow regular event handling*/;
      },

      // define custom clipboard Text representations for Nodes
      clipboardTextSerializer: (slice: Slice) => serializeDocumentFragment(editor, slice.content),
    },
  });
