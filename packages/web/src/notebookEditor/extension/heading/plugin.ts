import { Plugin } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';

import { createMarkHolderNode, generateNodeId, getParagraphNodeType, getSelectedNode, isHeadingNode, isTextNode, stringifyMarksArray, AttributeType, HeadingAttributes } from '@ureeka-notebook/web-service';

// ********************************************************************************
export const headingPlugin = () => new Plugin({
  // -- Props ---------------------------------------------------------------------
  props: {
    // .. Handler .................................................................
    // When the heading is going to be splitted (i.e. the user press the Enter key)
    // the newly created node must have a new unique id while copying the rest of
    // the attributes.
    handleKeyDown: (view: EditorView, event: KeyboardEvent) => {
      const { state, dispatch } = view;
      const { selection, tr } = state;

      // gets the currently selected node
      const { depth } = selection.$anchor;
      const node = getSelectedNode(state, depth/*parent node of text selection*/);

      if(!node || !isHeadingNode(node)) return false/*don't handle -- not a heading*/;

      if(event.key === 'Enter') {
        // check whether the selection is at the end of the content, if so a
        // paragraph node must be created and the marks must be deleted.
        const parentPos = selection.anchor - selection.$anchor.parentOffset;

        const isAtStart = selection.anchor === parentPos/*inside the parent*/,
              startPos = selection.anchor/*before modifications*/;

        const isAtEnd = selection.anchor === parentPos + node.nodeSize - 2/*end of parent + end of node*/;

        // Split the node from the current selection and append the attributes.
        tr.deleteRange(selection.from, selection.to)/*delete the content if is a range selection*/;

        if(isAtEnd){
          tr.removeMark(selection.from, selection.to, null/*all marks*/)/*remove marks*/
            .split(selection.from, 1, [{ type: getParagraphNodeType(state.schema) }])/*split and insert paragraph node*/;
          dispatch(tr);
          return true/*event handled*/;
        } /* else -- create Heading below */

        const newAttrs: HeadingAttributes = { ...node.attrs, [AttributeType.Id]: generateNodeId() };
        tr.split(selection.from, 1/*single depth*/, [{ type: node.type, attrs: newAttrs }])/*split node and insert new heading*/;

        // if at start and split Heading firstChild is a TextNode that had Marks, add MarkHolder with those Marks
        if(isAtStart){
          const { firstChild } = node;
          if(firstChild && isTextNode(firstChild) && firstChild.marks.length > 0) {
            tr.insert(startPos, createMarkHolderNode(view.state.schema, { storedMarks: stringifyMarksArray(firstChild.marks) }));
          } /* else -- firstChild is not a Text Node with Marks, do not add MarkHolder */
        } /* else -- no need to add MarkHolder */

        dispatch(tr);
        return true/*event handled*/;
      } /* else -- key is not handled */

      return false/*event not handled*/;
    },
  },
});

