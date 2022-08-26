import { TextSelection } from 'prosemirror-state';

import { getSelectedNode, isTextNode, AttributeType, SelectionDepth, Command } from '@ureeka-notebook/web-service';

// ********************************************************************************
// == Type ========================================================================
type SelectionRange = { from: number; to: number; }

// == Selection ===================================================================
/** set a TextSelection given the Range */
export const setTextSelectionCommand = (selectionRange: SelectionRange): Command => (state, dispatch) => {
  const { doc, tr } = state;
  const { from, to } = selectionRange;

  const minPos = TextSelection.atStart(doc).from;
  const maxPos = TextSelection.atEnd(doc).to;

  const resolvedFrom = Math.min(Math.max(from, minPos), maxPos);
  const resolvedEnd = Math.min(Math.max(to, minPos), maxPos);

  const selection = TextSelection.create(doc, resolvedFrom, resolvedEnd);

  tr.setSelection(selection);
  dispatch(tr);
  return true/*Command executed*/;
};

// == Range =======================================================================
export const updateAttributesInRangeCommand = (attribute: AttributeType, value: string, depth: SelectionDepth): Command => (state, dispatch) => {
  const { tr } = state;

  tr.setSelection(state.selection);
  const { from, to } = tr.selection;

  // its a grouped selection: iterate over the nodes and set the style on each of them
  if(from !== to) {
    const { doc } = tr;
    doc.nodesBetween(from, to, (node, pos) => {
      if(!tr.doc || !node) return false/*nothing to do*/;
      if(isTextNode(node)) return false/*skip text nodes since they cannot have attributes*/;

      const nodeAttrs = { ...node.attrs, [attribute]: value };
      tr.setNodeMarkup(pos, undefined/*preserve type*/, nodeAttrs);
      return true;
    });
  } else {
    const node = getSelectedNode(state, depth);
    if(!node) return true/*nothing else to do*/;

    const nodeAttrs = { ...node.attrs, [attribute]: value };
    let pos = state.selection.$anchor.before(depth);
    // NOTE: there is a case when the node size is 1. Any attempt to select the node
    //       based on its depth from the selection will select either the node before
    //       or after that. This is a hack until a better one is found.
    if(node.nodeSize == 1) pos++;

    tr.setNodeMarkup(pos, undefined/*preserve type*/, nodeAttrs);
  }

  dispatch(tr);
  return true/*Command executed*/;
};
