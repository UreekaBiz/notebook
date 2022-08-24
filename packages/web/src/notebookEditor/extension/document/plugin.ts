import { Plugin, PluginKey } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';

import { NotebookSchemaType } from '@ureeka-notebook/web-service';

import { NoPluginState } from 'notebookEditor/model/type';

// ********************************************************************************
// this Plugin implements behavior that is common to all the document

// == Plugin ======================================================================
const documentKey = new PluginKey<NoPluginState, NotebookSchemaType>('documentKey');
export const DocumentPlugin = () => {
  const plugin = new Plugin<NoPluginState, NotebookSchemaType>({
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
    },
  });

  return plugin;
};
