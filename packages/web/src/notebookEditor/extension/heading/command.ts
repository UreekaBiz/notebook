import { CommandProps } from '@tiptap/core';
import { Selection } from 'prosemirror-state';

import { createBoldMark, isHeadingLevel, AttributeType, CommandFunctionType, HeadingLevel, NodeName, MarkName } from '@ureeka-notebook/web-service';

import { createMarkHolderJSONNode } from 'notebookEditor/extension/markHolder/util';

// ********************************************************************************
// NOTE: ambient module to ensure command is TypeScript-registered for TipTap
declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    [NodeName.HEADING/*Expected and guaranteed to be unique. (SEE: /notebookEditor/model/node)*/]: {
      setHeading: CommandFunctionType<typeof setHeadingCommand, ReturnType>;
      toggleHeading: CommandFunctionType<typeof toggleHeadingCommand, ReturnType>;
    };
  }
}

// --------------------------------------------------------------------------------
export const setHeadingCommand = (attributes: { level: HeadingLevel; }) => ({ editor, chain }: CommandProps) => {
  if(!isHeadingLevel(attributes[AttributeType.Level])) return false/*invalid command, level for heading not supported*/;

  if(shouldInsertMarkHolder(editor.state.selection)) {
    return chain().setNode(NodeName.HEADING, attributes)
                  .insertContent(createMarkHolderJSONNode(editor, [MarkName.BOLD]))
                  .run();
   } /* else -- no need to add MarkHolder */

  return chain().setNode(NodeName.HEADING, attributes)
                .command(applyBoldToHeadingContent)
                .run();
};


export const toggleHeadingCommand = (attributes: { level: HeadingLevel; }) => ({ editor, chain }: CommandProps) => {
  if(!isHeadingLevel(attributes[AttributeType.Level])) {
    return false/*invalid command, level for heading not supported*/;
  } /* else -- valid level */

  if(editor.isActive(NodeName.HEADING) && editor.state.selection.$anchor.parent.attrs[AttributeType.Level] === attributes[AttributeType.Level]/*is the same heading -- toggle*/) {
    return chain().toggleNode(NodeName.PARAGRAPH, NodeName.HEADING, attributes).run();
  } /* else -- set heading normally */

  if(shouldInsertMarkHolder(editor.state.selection)) {
    return chain().toggleNode(NodeName.HEADING, NodeName.PARAGRAPH, attributes)
                  .insertContent(createMarkHolderJSONNode(editor, [MarkName.BOLD]))
                  .run();
  } /* else -- no need to add MarkHolder */

  return chain().toggleNode(NodeName.HEADING, NodeName.PARAGRAPH, attributes)
                .command(applyBoldToHeadingContent)
                .run();
};

// == Util ========================================================================
// applies the Bold Mark to the whole content of the parents of the selection
const applyBoldToHeadingContent = (props: CommandProps) => {
  const { editor, dispatch,  tr } = props;
  if(tr.selection.$anchor.parent.content.size < 0) return false/*command cannot be executed, the Heading has no content to apply the Bold Mark*/;

  if(dispatch) {
    // apply Bold Mark to anchor parent Content
    const currentAnchorPos = tr.selection.$anchor.pos;
    const anchorOffset = tr.selection.$anchor.parentOffset,
          anchorParentPos = currentAnchorPos - anchorOffset;
    tr.addMark(anchorParentPos, anchorParentPos + tr.selection.$anchor.parent.nodeSize - 2/*account for the start and end of the parent Node*/, createBoldMark(editor.schema));

    // apply Bold Mark to head parent Content
    const currentHeadPos = tr.selection.$head.pos;
    const headOffset = tr.selection.$head.parentOffset,
          headParentPos = currentHeadPos - headOffset;
    tr.addMark(headParentPos, headParentPos + tr.selection.$head.parent.nodeSize - 2/*account for the start and end of the parent Node*/, createBoldMark(editor.schema));

    // apply Bold Mark to any nodes in between anchor and head
    currentHeadPos > currentAnchorPos/*check which position is bigger to add Mark correctly*/
      ? tr.addMark(currentAnchorPos, currentHeadPos, createBoldMark(editor.schema))
      : tr.addMark(currentHeadPos, currentAnchorPos, createBoldMark(editor.schema));

    dispatch(tr);
  } /* else -- called from can() (SEE: src/notebookEditor/README.md/#Commands) */

  return true/*command can be executed*/;
};

// a MarkHolder should be inserted if the Selection is empty, the anchor and the
// head are in the same place, and the parent of the selection has no content
const shouldInsertMarkHolder = (selection: Selection) => selection.empty && selection.$anchor.pos === selection.$head.pos && selection.$anchor.parent.content.size < 1;
