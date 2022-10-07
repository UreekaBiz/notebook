import { Plugin } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';

import { getReplacedTextMarkMarkType, isGapCursorSelection } from '@ureeka-notebook/web-service';

// == Plugin ======================================================================
export const replacedTextMarkPlugin = () => new Plugin({
  // -- Props ---------------------------------------------------------------------
  props: {
    // .. Handler .................................................................
      // prevent the User from typing content into the ReplacedTextMark. If the
    // content is inserted inside text within a ReplacedTextMark,
    // the Mark will be splitted into two
    handleTextInput: (view: EditorView, from: number, to: number, text: string) => {
      // prevent incorrect resulting Selection behavior when coming from GapCursor Selection
      if(isGapCursorSelection(view.state.selection)) return false/*let PM handle the event*/;

      const { dispatch, state } = view;
      const { tr } = state;
      const replacedNodeMarkType = getReplacedTextMarkMarkType(view.state.schema);

      // insert the text in the normal way and remove the replaced text mark from it
      tr.insertText(text, from, to)
        .removeMark(from, from + text.length/*remove mark in inserted text*/, replacedNodeMarkType);

      // dispatch Transaction into the view
      dispatch(tr);
      return true/*handled*/;
    },
  },
});
