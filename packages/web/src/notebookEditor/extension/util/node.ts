import { GapCursor } from 'prosemirror-gapcursor';
import { DOMParser, Fragment, Node as ProseMirrorNode, ParseOptions } from 'prosemirror-model';
import { EditorState, Transaction } from 'prosemirror-state';

import { isGapCursorSelection, AbstractDocumentUpdate, Command, JSONNode, NodeName, NotebookSchemaType } from '@ureeka-notebook/web-service';

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

// -- Block Selection -------------------------------------------------------------
// NOTE: these Commands must be located in web since whenever the Commands come
//       from service-common or another package, the GapCursor is set, but it does
//       not get shown in the UI
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
  public update(editorState: EditorState<NotebookSchemaType>, tr: Transaction<NotebookSchemaType>) {
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
  public update(editorState: EditorState<NotebookSchemaType>, tr: Transaction<NotebookSchemaType>) {
    const { selection } = editorState;
    if(selection.$anchor.parent.type.name !== this.blockNodeName) return false/*node does not allow GapCursor*/;
    if(isGapCursorSelection(selection) && (selection.anchor !== 0)) return false/*selection already a GapCursor*/;

    const isAtEnd = selection.anchor === editorState.doc.nodeSize - 3/*past the Node, including the doc tag*/;
    if(!isAtEnd) return false/*no need to set GapCursor*/;

    tr.setSelection(new GapCursor(tr.doc.resolve(editorState.doc.nodeSize - 2/*past the Node*/)));
    return tr/*updated*/;
  }
}

// -- Check -----------------------------------------------------------------------
/** Check whether the given input is a {@link Fragment} */
export const isFragment = (nodeOrFragment: ProseMirrorNode | Fragment): nodeOrFragment is Fragment =>
  nodeOrFragment.toString().startsWith('<');
