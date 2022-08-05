import { Plugin, PluginSpec } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';

import { getReplacedTextMarkMarkType, NotebookSchemaType } from '@ureeka-notebook/web-service';

// == Plugin ======================================================================
export const ReplacedTextMarkPlugin = () => new Plugin<NotebookSchemaType>({
  // -- Props ---------------------------------------------------------------------
  props: {
    // .. Handler .................................................................
      // prevent the User from typing content into the ReplacedTextMark. If the
    // content is inserted inside text within a ReplacedTextMark,
    // the Mark will be splitted into two
    handleTextInput: (view: EditorView, from: number, to: number, text: string) => {
      const { dispatch, state } = view;
      const { tr } = state;
      const replacedNodeMarkType = getReplacedTextMarkMarkType(view.state.schema);

      // insert the text in the normal way and remove the replaced text mark from it
      tr.insertText(text, from, to)
        .removeMark(from, to + 1/*exclusive selection -- add one to wrap whole text*/, replacedNodeMarkType);

      // dispatch Transaction into the view
      dispatch(tr);
      return true/*handled*/;
    },
  },
} as PluginSpec);
