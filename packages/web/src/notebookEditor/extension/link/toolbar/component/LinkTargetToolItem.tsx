import { getMarkAttributes } from '@tiptap/core';
import { Box, Select } from '@chakra-ui/react';
import { ChangeEventHandler } from 'react';

import { isLinkMarkAttributes, isLinkTargetValue, AttributeType, LinkTarget, MarkName } from '@ureeka-notebook/web-service';

import { EditorToolComponentProps } from 'notebookEditor/toolbar/type';

import { getReadableLinkTarget } from '../../util';

interface Props extends EditorToolComponentProps {/*no additional*/}
export const LinkTargetToolItem: React.FC<Props> = ({ editor, depth }) => {
  const attrs = getMarkAttributes(editor.state, MarkName.LINK);
  if(!isLinkMarkAttributes(attrs)) return null/*nothing to render*/;

  // == Handlers ==================================================================
  const handleChange: ChangeEventHandler<HTMLSelectElement> = (event) => {
    const target = event.target.value;
    if(target === attrs[AttributeType.Target]|| !isLinkTargetValue(target)) return/*nothing to do*/;

    const { pos: prevPos } = editor.state.selection.$anchor;
    editor.chain()
          .extendMarkRange(MarkName.LINK)
          .setLink({ ...attrs, target })
          .setTextSelection(prevPos)
          .run();

  // Focus the editor again
    editor.commands.focus();
  };

  // == UI ========================================================================
  return (
    <Box>
      Target
      <Box marginTop='5px'>
        <Select
          value={attrs[AttributeType.Target]}
          size='sm'
          marginTop='5px'
          onChange={handleChange}
        >
          {Object.entries(LinkTarget).map(([key, value]) => (
            <option key={key} value={key}>{getReadableLinkTarget(value)}</option>
          ))}
        </Select>
      </Box>
    </Box>
  );
};
