import { EditorState, NodeSelection, Plugin, PluginKey, Transaction } from 'prosemirror-state';

import { isNestedViewBlockNode, isTextSelection } from '@ureeka-notebook/web-service';

// ********************************************************************************
/**
 * Plugin used to store information that is used by NestedNodeView Nodes
 * to determine where to place the cursor when expanding themselves
 * without overriding the default arrow key behavior
 */
// == Constant ====================================================================
export const nestedViewNodePluginKey = new PluginKey<NestedViewNodePluginState>('nestedViewNodePluginKey');

// == Class =======================================================================
export class NestedViewNodePluginState {
  constructor(public prevCursorPos: number) {/*nothing additional*/}

  // produce a new Plugin state
  apply = (tr: Transaction, thisPluginState: NestedViewNodePluginState, oldEditorState: EditorState, newEditorState: EditorState) => {
    this.prevCursorPos = oldEditorState.selection.from;
    return this/*state updated*/;
  };
}

// == Plugin ======================================================================
export const nestedViewNodePlugin = () => {
  const nestedViewNodePlugin = new Plugin<NestedViewNodePluginState>({
    // -- Setup -------------------------------------------------------------------
    key: nestedViewNodePluginKey,

    // -- State -------------------------------------------------------------------
    state: {
      // initialize the plugin state
      init: (_, state) => new NestedViewNodePluginState(0/*default*/),

      // apply changes to the plugin state from a view transaction
      apply: (transaction, thisPluginState, oldState, newState) => thisPluginState.apply(transaction, thisPluginState, oldState, newState),
    },

    // ensure that a TextSelection inside a NestedViewBlockNode always
    // selects that Node, making its inner View render
    appendTransaction(transactions, oldState, newState) {
      const { tr, selection } = newState;
      const { parent } = selection.$anchor;

      if(isTextSelection(selection) && isNestedViewBlockNode(parent)) {
        tr.setSelection(NodeSelection.create(tr.doc, selection.$from.pos - selection.$from.parentOffset - 1/*inside the Node*/));
        return tr/*modified*/;
      } /* else -- do nothing */

      return/*do not append Transaction*/;
    },
  });

  return nestedViewNodePlugin;
};
