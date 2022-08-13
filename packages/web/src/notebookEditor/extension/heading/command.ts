import { CommandProps } from '@tiptap/core';

import { createBoldMark, getBlockNodeRange, generateNodeId, isHeadingLevel, isHeadingNode, AttributeType, CommandFunctionType, HeadingLevel, NodeName, MarkName, NodeIdentifier } from '@ureeka-notebook/web-service';

import { createMarkHolderJSONNode } from 'notebookEditor/extension/markHolder/util';

// ********************************************************************************
// NOTE: ambient module to ensure command is TypeScript-registered for TipTap
declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    [NodeName.HEADING/*Expected and guaranteed to be unique. (SEE: /notebookEditor/model/node)*/]: {
      /** create a Heading and set the cursor inside of it */
      setHeading: CommandFunctionType<typeof setHeadingCommand, ReturnType>;
    };
  }
}

// --------------------------------------------------------------------------------
export const setHeadingCommand = (attributes: { level: HeadingLevel; }) => ({ editor, chain }: CommandProps) => {
  if(!isHeadingLevel(attributes[AttributeType.Level])) return false/*invalid command, level for heading not supported*/;

  const { parent } = editor.state.selection.$anchor;
  if(editor.state.selection.empty && parent.content.size < 1) {
    return chain().setNode(NodeName.HEADING, attributes).insertContent(createMarkHolderJSONNode(editor, [MarkName.BOLD])).run();
  } /* else -- no need to add MarkHolder */

  return chain()
        .setNode(NodeName.HEADING, attributes)
        .command(applyBoldToHeadingContent)
        .command(setIdsToNewHeadings/*TODO: find a better way to address this issue once commands are standardized*/)
        .run();
};

// == Util ========================================================================
// applies the Bold Mark to the whole content of the parents of the selection
const applyBoldToHeadingContent = (props: CommandProps) => {
  const { editor, dispatch, tr } = props;
  if(tr.selection.$anchor.parent.content.size < 0) return false/*command cannot be executed, the Heading has no content to apply the Bold Mark*/;

  if(dispatch) {
    const { from, to } = getBlockNodeRange(editor.state.selection);
    tr.addMark(from, to, createBoldMark(editor.schema));
    dispatch(tr);
  } /* else -- called from can() (SEE: src/notebookEditor/README.md/#Commands) */

  return true/*command can be executed*/;
};

// if new Headings are created while setting the block type, ensure they do
// not get repeated Ids
const setIdsToNewHeadings = (props: CommandProps) => {
  const seenIds = new Set<NodeIdentifier>();
  const { editor, dispatch, tr } = props;

  if(dispatch) {
    const { from, to } = getBlockNodeRange(editor.state.selection);
    tr.doc.nodesBetween(from, to, (node, nodePos) => {
      const id = node.attrs[AttributeType.Id];
      if(!id) return/*nothing left to do*/;

      if(id && isHeadingNode(node) && seenIds.has(id)) {
        tr.setNodeMarkup(nodePos, node.type, { ...node.attrs, [AttributeType.Id]: generateNodeId() });
        return/*nothing left to do*/;
      } /* else -- add to seen ids */

      seenIds.add(id);
    });

    dispatch(tr);
  } /* else -- called from can() (SEE: src/notebookEditor/README.md/#Commands) */

  return true/*command can be executed*/;
};

