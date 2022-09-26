import { DOMParser, Fragment, Node as ProseMirrorNode, ParseOptions } from 'prosemirror-model';

import { JSONNode, NotebookSchemaType } from '@ureeka-notebook/web-service';

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

// -- Check -----------------------------------------------------------------------
/** Check whether the given input is a {@link Fragment} */
export const isFragment = (nodeOrFragment: ProseMirrorNode | Fragment): nodeOrFragment is Fragment =>
  nodeOrFragment.toString().startsWith('<');
