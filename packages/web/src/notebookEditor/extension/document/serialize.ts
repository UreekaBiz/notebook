import { Editor } from '@tiptap/core';

import { getThemeValue, AttributeType, NodeName, DEFAULT_DEMO_ASYNC_NODE_TEXT, DEFAULT_CODEBLOCK_REFERENCE_NODE_TEXT, REMOVED_CODEBLOCK_VISUALID } from '@ureeka-notebook/web-service';

import { Fragment, Node as ProseMirrorNode } from 'prosemirror-model';

import { visualIdFromCodeBlockReference } from '../codeblock/util';

// ********************************************************************************
// == Constant ====================================================================
// a Map defining specific Text serialization functions (i.e. how the Node) gets
// pasted into the clipboard for Text only paste) for Nodes, given their NodeName
const customSerializerMap = new Map<NodeName, (editor: Editor, node: ProseMirrorNode) => string>([
  [
    NodeName.CODEBLOCK_REFERENCE,
    (editor, node) => {
      const leftDelimiter = node.attrs[AttributeType.LeftDelimiter] ?? getThemeValue(NodeName.CODEBLOCK_REFERENCE, AttributeType.LeftDelimiter);

      const referencedVisualId = visualIdFromCodeBlockReference(editor, node.attrs[AttributeType.CodeBlockReference]);
      const visualId = referencedVisualId === REMOVED_CODEBLOCK_VISUALID
          ? DEFAULT_CODEBLOCK_REFERENCE_NODE_TEXT
          : referencedVisualId;

      const rightDelimiter = node.attrs[AttributeType.RightDelimiter] ?? getThemeValue(NodeName.CODEBLOCK_REFERENCE, AttributeType.RightDelimiter);

      return `${leftDelimiter}${visualId}${rightDelimiter}`;
    },
  ],
  [
    NodeName.DEMO_ASYNC_NODE,
    (editor, node) => `${node.attrs[AttributeType.Text] ?? DEFAULT_DEMO_ASYNC_NODE_TEXT}`,
  ],
  [
    NodeName.EDITABLE_INLINE_NODE_WITH_CONTENT,
    (editor, node) => `~${node.textContent}~`,
  ],
  [
    NodeName.NESTED_VIEW_BLOCK_NODE,
    (editor, node) => `\n~${node.textContent}~\n`,
  ],
]);

// == Serialize ===================================================================
// NOTE: this is inspired by https://github.com/ProseMirror/prosemirror-model/blob/eef20c8c6dbf841b1d70859df5d59c21b5108a4f/src/fragment.js#L46

// Define how to specifically serialize Nodes of different types to Text, so that
// they get pasted to the clipboard as such. This will only affect their plain
// text paste behavior, since otherwise they will be pasted as Nodes
export const serializeDocumentFragment = (editor: Editor, fragment: Fragment) => {
  const blockSeparator = '\n\n'/*default separator*/;
  const leafText = undefined/*do not add anything in between Leaf Nodes by default*/;

  // whether a Block Node in the Fragment is separated by adding a blockSeparator
  let blockSeparated: boolean = true/*default*/;

  // the serialized Text representation of the given Fragment
  let serializedText: string = ''/*default*/;

  const from = 0/*Fragment start*/,
        to = fragment.size;

  fragment.nodesBetween(from, to, (node, pos) => {
    // check if a custom serializer handles this Node
    const customSerializer = customSerializerMap.get(node.type.name as NodeName/*by definition*/);
    if(customSerializer) {
      serializedText += customSerializer(editor, node);
      return false/*do not descend further*/;
    } /* else -- use default serializer behavior */

    if(node.isText) {
      serializedText += node.text?.slice(Math.max(from, pos) - pos, to - pos) || ''/*don't add anything*/;
      blockSeparated = !blockSeparator;
    } else if(node.isLeaf && leafText) {
      serializedText += leafText;
      blockSeparated = !blockSeparator;
    } else if(!blockSeparated && node.isBlock) {
      serializedText += blockSeparator;
      blockSeparated = true;
    } /* else -- keep descending */
    return true;
  }, 0/*start of the Fragment*/);

  return serializedText;
};
