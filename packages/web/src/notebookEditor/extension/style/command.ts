import { CommandProps, Editor } from '@tiptap/core';

import { AttributeType, NodeName } from '@ureeka-notebook/web-service';

import { getSelectedNode } from 'notebookEditor/extension/util/node';
import { ExtensionName, SelectionDepth } from 'notebookEditor/model/type';

import { CommandFunctionType } from '../util/type';

// ********************************************************************************
// == Command =====================================================================
// NOTE: ambient module to ensure command is TypeScript-registered for TipTap
declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    [ExtensionName.STYLE]: {
      /** Set the Style attributes of a node */
      setStyle: CommandFunctionType<typeof setStyleCommand, ReturnType>;
    };
  }
}

// --------------------------------------------------------------------------------
export const setStyleCommand = (attribute: AttributeType, value: string, depth: SelectionDepth) => ({ tr, state, dispatch }: CommandProps): boolean => {
  if(!dispatch) throw new Error('Dispatch is unexpectedly undefined.');
  tr.setSelection(state.selection);
  const { from, to } = tr.selection;

  // its a grouped selection: iterate over the nodes and set the style on each of them
  if(from !== to) {
    const { doc } = tr;
    doc.nodesBetween(from, to, (node, pos) => {
      if(!tr.doc || !node) return false;
      if(node.type.name === NodeName.TEXT) return false/*skip text nodes since they cannot have attributes*/;

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
  if(!tr.docChanged) return false/*nothing to do*/;

  dispatch(tr);
  return true;
};

// == Util ========================================================================
export const setNodeStyle = (editor: Editor, attribute: AttributeType, value: string, depth: SelectionDepth, fullySelectedNodes?: boolean) =>
  editor.commands.setStyle(attribute, value, depth);
