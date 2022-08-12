import { Selection } from 'prosemirror-state';

// ********************************************************************************
// == Range =======================================================================
/**
 * computes the Range that holds all Nodes in between the start and end of the
 * Blocks located at the anchor and head of the given {@link Selection},
 * regardless of where the anchor and head are located in those Blocks
 */
export const getBlockNodeRange = (selection: Selection) => {
  const { pos: anchorPos } = selection.$anchor,
        { pos: headPos } = selection.$head;

  if(anchorPos < headPos) {
    return {
      from: anchorPos - selection.$anchor.parentOffset,
      to: (headPos - selection.$head.parentOffset) + selection.$head.parent.nodeSize - 2/*account for the start and end of the parent Node*/,
    };
  } /* else -- head is past anchor */

  // return the right range by inverting from and to
  return {
    from: headPos - selection.$head.parentOffset,
    to: (anchorPos - selection.$anchor.parentOffset) + selection.$anchor.parent.nodeSize - 2/*account for the start and end of the parent Node*/,
  };
};
