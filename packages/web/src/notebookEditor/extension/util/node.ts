import { Editor } from '@tiptap/core';
import { GapCursor } from 'prosemirror-gapcursor';
import { DOMParser, Fragment, Node as ProseMirrorNode, ParseOptions } from 'prosemirror-model';
import { EditorState, TextSelection, Transaction } from 'prosemirror-state';

import { isGapCursorSelection, AbstractDocumentUpdate, Attributes, ClearNodesDocumentUpdate, CreateBlockNodeDocumentUpdate, Command, JSONNode, NodeName, NotebookSchemaType } from '@ureeka-notebook/web-service';

import { applyDocumentUpdates } from 'notebookEditor/command/update';

import { SetParagraphDocumentUpdate } from '../paragraph/command';
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

// -- Block Toggle ----------------------------------------------------------------
// NOTE: this Utility is located in web since it makes use of applyDocumentUpdates
// NOTE: this is a Utility and not a Command for the same reason as above
// NOTE: this Utility must make use of applyDocumentUpdates to ensure consistent
//       resulting Selection behavior when toggling Block Nodes
export const toggleBlock = (editor: Editor, blockNodeName: NodeName, blockAttrs: Partial<Attributes>) => {
  const { selection } = editor.state;
  if(!selection.empty) return false/*do not handle*/;

  const togglingBlock = selection.$anchor.parent.type.name === blockNodeName;
  if(togglingBlock) {
    return applyDocumentUpdates(editor, [new SetParagraphDocumentUpdate()/*default Block*/]);
  } /* else -- setting Block */

  return applyDocumentUpdates(editor, [new CreateBlockNodeDocumentUpdate(blockNodeName, blockAttrs)]);
};

// -- Block Backspace -------------------------------------------------------------
// NOTE: the following Block Commands must be located in web since
//       whenever they come from common or a similar place there are issues with
//       the GapCursor Selection or the state getting stuck
/** ensure the Block at the Selection is deleted on Backspace if its empty */
export const blockBackspaceCommand = (blockNodeName: NodeName): Command => (state, dispatch) => {
  const updatedTr =  new BlockBackspaceDocumentUpdate(blockNodeName).update(state, state.tr);
  if(updatedTr) {
    dispatch(updatedTr);
    return true/*Command executed*/;
  } /* else -- Command cannot be executed */

  return false/*not executed*/;
};
export class BlockBackspaceDocumentUpdate implements AbstractDocumentUpdate {
  public constructor(private readonly blockNodeName: NodeName) {/*nothing additional*/ }

  /*
   * modify the given Transaction such that the Block at the Selection
   * is deleted on Backspace if it is empty and return it
   */
  public update(editorState: EditorState, tr: Transaction) {
    const { empty, $anchor, anchor } = editorState.selection,
    isAtStartOfDoc = anchor === 1/*first position inside the node, at start of Doc*/;

    if(!empty || $anchor.parent.type.name !== this.blockNodeName) return false/*let event be handled elsewhere*/;
    if(isAtStartOfDoc || !$anchor.parent.textContent.length) {
      const clearedNodesUpdatedTr = new ClearNodesDocumentUpdate().update(editorState, tr);
      return clearedNodesUpdatedTr/*updated*/;
    } /* else -- no need to delete blockNode */

    return false/*let Backspace event be handled elsewhere*/;
  }
}

/**
 * ensure the expected Mod-Backspace behavior is maintained inside
 * Block Nodes by removing a '\n' if required
 * */
 export const blockModBackspaceCommand = (blockNodeName: NodeName): Command => (state, dispatch) => {
  const updatedTr =  new BlockModBackspaceDocumentUpdate(blockNodeName).update(state, state.tr);
  if(updatedTr) {
    dispatch(updatedTr);
    return true/*Command executed*/;
  } /* else -- Command cannot be executed */

  return false/*not executed*/;
};
export class BlockModBackspaceDocumentUpdate implements AbstractDocumentUpdate {
  public constructor(private readonly blockNodeName: NodeName) {/*nothing additional*/ }

  /*
   * modify the given Transaction such that the expected Mod-Backspace behavior
   * is maintained inside Block Nodes, by removing a '\n' if
   * required, and return it
   */
  public update(editorState: EditorState, tr: Transaction) {
    const { selection } = tr;
    const { empty, $from, from } = selection;

    if(!empty || $from.parent.type.name !== this.blockNodeName) return false/*let event be handled elsewhere*/;

    const { parentOffset } = $from;
    if($from.parent.textContent.charAt(parentOffset-1/*account for start of parentNode*/) === '\n') {
      tr.setSelection(TextSelection.create(tr.doc, from, from-1/*remove the '\n'*/))
        .deleteSelection();

      return tr/*updated*/;
    } /* else -- */

    return false/*let event be handled elsewhere*/;
  }
}

// -- Block Selection -------------------------------------------------------------
/**
 * ensure correct arrow up behavior inside a Block Node by creating a new
 * {@link GapCursor} selection when the arrowUp key is pressed if the selection
 * is at the start of it
 */
 export const blockArrowUpCommand = (blockNodeName: NodeName): Command => (state, dispatch) => {
  const updatedTr =  new BlockArrowUpDocumentUpdate(blockNodeName).update(state, state.tr);
  if(updatedTr) {
    dispatch(updatedTr);
    return true/*Command executed*/;
  } /* else -- Command cannot be executed */

  return false/*not executed*/;
};
export class BlockArrowUpDocumentUpdate implements AbstractDocumentUpdate {
  public constructor(private readonly blockNodeName: NodeName) {/*nothing additional*/ }

  /*
   * modify the given Transaction such that the Selection becomes a
   * GapCursor Selection when the arrowUp key is pressed if the Selection
   * is at the start of it and return it
   */
  public update(editorState: EditorState, tr: Transaction) {
    const { selection } = editorState;
    if(selection.$anchor.parent.type.name !== this.blockNodeName) return false/*let event be handled elsewhere*/;

    const isAtStart = selection.anchor === 1/*at the start of the doc*/;
    if(!isAtStart) return false/*no need to set GapCursor*/;

    tr.setSelection(new GapCursor(tr.doc.resolve(0/*at the start of the doc*/)));
    return tr/*updated*/;
  }
}

/**
 * ensure correct arrow up behavior inside a Block Node by creating a new
 * {@link GapCursor} selection when the arrowDown is pressed if the selection
 * is at the end of it
 */
export const blockArrowDownCommand = (blockNodeName: NodeName): Command => (state, dispatch) => {
  const updatedTr =  new BlockArrowDownDocumentUpdate(blockNodeName).update(state, state.tr);
  if(updatedTr) {
    dispatch(updatedTr);
    return true/*Command executed*/;
  } /* else -- Command cannot be executed */

  return false/*not executed*/;
};
export class BlockArrowDownDocumentUpdate implements AbstractDocumentUpdate {
  public constructor(private readonly blockNodeName: NodeName) {/*nothing additional*/ }

  /*
   * modify the given Transaction such that the Selection becomes a
   * GapCursor Selection when the arrowDown key is pressed if the Selection
   * is at the start of it and return it
   */
  public update(editorState: EditorState, tr: Transaction) {
    const { selection } = editorState;
    if(selection.$anchor.parent.type.name !== this.blockNodeName) return false/*node does not allow GapCursor*/;
    if(isGapCursorSelection(selection) && (selection.anchor !== 0)) return false/*selection already a GapCursor*/;

    const isAtEnd = selection.anchor === editorState.doc.nodeSize - 3/*past the Node, including the doc tag*/;
    if(!isAtEnd) return false/*no need to set GapCursor*/;

    tr.setSelection(new GapCursor(tr.doc.resolve(editorState.doc.nodeSize - 2/*past the Node*/)));
    return tr/*updated*/;
  }
}

// -- Content ---------------------------------------------------------------------
/** Check whether the given input is a {@link Fragment} */
export const isFragment = (nodeOrFragment: ProseMirrorNode | Fragment): nodeOrFragment is Fragment =>
  nodeOrFragment.toString().startsWith('<');
