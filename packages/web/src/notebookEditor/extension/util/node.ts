import { Editor } from '@tiptap/core';
import { DOMParser, Fragment, Node as ProseMirrorNode, ParseOptions } from 'prosemirror-model';
import { GapCursor } from 'prosemirror-gapcursor';

import { isGapCursorSelection, JSONNode, NodeName, NotebookSchemaType } from '@ureeka-notebook/web-service';

import { elementFromString } from './parse';

// ********************************************************************************
// -- Creation --------------------------------------------------------------------
type CreateNodeFromContentOptions = {
  slice?: boolean;
  parseOptions?: ParseOptions;
}
/**
 * Create a Node from a string that gets parsed, a {@link JSONNode} or an array of
 * {@link JSONNode}s. The options object can be specified to indicate whether the
 * content should be parsed as a Slice, as well as any other {@link ParseOptions}
 */
 export const createNodeFromContent = (schema: NotebookSchemaType, content: string | JSONNode | JSONNode[], options?: CreateNodeFromContentOptions): ProseMirrorNode | Fragment => {
  // default if options not given
  const slice  = options?.slice ?? true/*default*/;
  const parseOptions = options?.parseOptions ?? {/*default none*/};

  if(typeof content === 'object' && content !== null) {
    try {
      if(Array.isArray(content)) {
        return Fragment.fromArray(content.map(item => schema.nodeFromJSON(item)));
      } /* else -- content is not an array of JSONNodes, but a single Node */

      return schema.nodeFromJSON(content);
    } catch(error) {
      console.warn(`createNodeFromContent received invalid content: ${content}. Error: ${error}`);

      // return empty
      return createNodeFromContent(schema, ''/*empty*/, options);
    }
  } /* else -- did not receive an object */

  if(typeof content === 'string') {
    const parser = DOMParser.fromSchema(schema);
    if(slice) {
      return parser.parseSlice(elementFromString(content), parseOptions).content;
    } else {
      return parser.parse(elementFromString(content), parseOptions);
    }
  } /* else -- did not receive a string, return empty */

  return createNodeFromContent(schema, '', options);
};

// -- Backspace -------------------------------------------------------------------
/** Ensures the block at the selection is deleted on backspace if its empty */
export const handleBlockBackspace = (editor: Editor, nodeName: NodeName) => {
  const { empty, $anchor, anchor } = editor.state.selection,
        isAtStartOfDoc = anchor === 1/*first position inside the node, at start of Doc*/;

  if(!empty || $anchor.parent.type.name !== nodeName) return false/*let event be handled elsewhere*/;
  if(isAtStartOfDoc || !$anchor.parent.textContent.length) {
    return editor.commands.clearNodes();
  } /* else -- no need to delete blockNode */

  return false/*let event be handled elsewhere*/;
};

// -- Cursor Behavior -------------------------------------------------------------
/**
 * Ensures correct arrow up behavior when inside a block Node with text content
 * by creating a new {@link GapCursor} selection when the arrowUp key is pressed
 * if the selection is at the start of its
 */
 export const handleBlockArrowUp = (editor: Editor, nodeName: NodeName) => {
  const { view, state } = editor,
        { selection, tr } = state,
        { dispatch } = view;
  if(selection.$anchor.parent.type.name !== nodeName) return false/*node does not allow GapCursor*/;

  const isAtStart = selection.anchor === 1/*at the start of the doc*/;
  if(!isAtStart) return false/*no need to set GapCursor*/;

  tr.setSelection(new GapCursor(tr.doc.resolve(0/*at the start of the doc*/)));
  dispatch(tr);
  return true/*created a GapCursor selection*/;
};

/**
 * Ensures correct arrow down behavior when inside a block Node with text content
 * by creating a new {@link GapCursor} selection when the arrowDown key is pressed
 * if the selection is at the end of its content
 */
export const handleBlockArrowDown = (editor: Editor, nodeName: NodeName) => {
  const { view, state } = editor,
        { doc, selection, tr } = state,
        { dispatch } = view;
  if(selection.$anchor.parent.type.name !== nodeName) return false/*node does not allow GapCursor*/;
  if(isGapCursorSelection(selection) && (selection.anchor !== 0)) return false/*selection already a GapCursor*/;

  const isAtEnd = selection.anchor === doc.nodeSize - 3/*past the Node, including the doc tag*/;
  if(!isAtEnd) return false/*no need to set GapCursor*/;

  tr.setSelection(new GapCursor(tr.doc.resolve(doc.nodeSize - 2/*past the Node*/)));
  dispatch(tr);
  return true/*created a GapCursor selection*/;
};

// -- Check -----------------------------------------------------------------------
/** Check whether the given input is a {@link Fragment} */
export const isFragment = (nodeOrFragment: ProseMirrorNode | Fragment): nodeOrFragment is Fragment =>
  nodeOrFragment.toString().startsWith('<');
