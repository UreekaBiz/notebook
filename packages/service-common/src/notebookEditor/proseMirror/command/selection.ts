import { NodeSelection, TextSelection } from 'prosemirror-state';

import { minFromMax } from '../../../util/number';
import { AttributeType } from '../attribute';
import { isTextNode } from '../extension/text';
import { getSelectedNode, SelectionDepth } from '../selection';
import { Command } from './type';

// ********************************************************************************
// == Type ========================================================================
export type SelectionRange = { from: number; to: number; }

// == Selection ===================================================================
/** set a TextSelection given the Range */
export const setTextSelectionCommand = (selectionRange: SelectionRange): Command => (state, dispatch) => {
  const { doc, tr } = state;
  const { from, to } = selectionRange;

  const minPos = TextSelection.atStart(doc).from;
  const maxPos = TextSelection.atEnd(doc).to;

  const resolvedFrom = minFromMax(from, minPos, maxPos);
  const resolvedEnd = minFromMax(to, minPos, maxPos);

  const selection = TextSelection.create(doc, resolvedFrom, resolvedEnd);

  tr.setSelection(selection);
  dispatch(tr);
  return true/*Command executed*/;
};

/** set a NodeSelection at the given Node position */
export const setNodeSelectionCommand = (nodePos: number): Command => (state, dispatch) => {
  const { tr } = state;
  const { doc } = tr;

  tr.setSelection(NodeSelection.create(doc, minFromMax(nodePos, 0/*Doc start*/, doc.content.size)));
  dispatch(tr);
  return true;
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

