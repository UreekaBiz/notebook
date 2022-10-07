import { isNodeSelection, Editor, Extension } from '@tiptap/core';
import { EditorState, Plugin } from 'prosemirror-state';
import { Decoration, DecorationSet } from 'prosemirror-view';

import { ExtensionName } from 'notebookEditor/model/type';
import { SELECTED_TEXT_CLASS } from 'notebookEditor/theme/theme';

// ********************************************************************************
// highlights the current Selection when it is a TextSelection. The styles of
// will only apply when the editor is not focused.
// SEE: index.css
// REF: https://discuss.prosemirror.net/t/add-css-class-to-current-node-or-selected-nodes/1287

// == Extension ===================================================================
export const Highlight = Extension.create({
  name: ExtensionName.HIGHLIGHT/*Expected and guaranteed to be unique*/,

  // -- Plugin --------------------------------------------------------------------
  addProseMirrorPlugins() {return [highlightPlugin(this.editor)];},
});

// --------------------------------------------------------------------------------
const highlightPlugin = (editor: Editor) => new Plugin({
  props: {
    decorations(state: EditorState) {
      if(editor.view.hasFocus()) return undefined/*only show decoration if View is not focused*/;

      const { selection } = state;
      if(isNodeSelection(selection)) return undefined/*do nothing when a Node is selected*/;

      const { empty, from, to } = selection;
      if(empty) return undefined/*nothing to select*/;

      const decorations: Decoration[] = [];
      state.doc.nodesBetween(from, to, (node, pos, parent) => {
        if(node.isText && parent && parent.isTextblock/*parent is not a nested Editor View*/) {
          const nodeStart = pos;
          const nodeEnd = pos + node.nodeSize;

          if(nodeStart <= from) {
            decorations.push(Decoration.inline(from, from + (Math.min(nodeEnd, to) - from), { class: SELECTED_TEXT_CLASS }));
          } else {
            // check must be done backwards
            decorations.push(Decoration.inline(nodeStart, nodeStart + (to - nodeStart), { class: SELECTED_TEXT_CLASS }));
          }
        } /* else -- ignore Node */
      });

      return DecorationSet.create(state.doc, decorations);
    },
  },
});
