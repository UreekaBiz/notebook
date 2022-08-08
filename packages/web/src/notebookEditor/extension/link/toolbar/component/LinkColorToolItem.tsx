import { getMarkAttributes } from '@tiptap/core';

import { isLinkMarkAttributes, AttributeType, MarkName } from '@ureeka-notebook/web-service';

import { ColorPicker } from 'notebookEditor/extension/style/component/ColorPicker';
import { getThemeValue } from 'notebookEditor/extension/theme/theme';
import { textColors } from 'notebookEditor/theme/type';
import { EditorToolComponentProps } from 'notebookEditor/toolbar/type';

interface Props extends EditorToolComponentProps {/*no additional*/}
export const LinkColorToolItem: React.FC<Props> = ({ editor, depth }) => {
  const attrs = getMarkAttributes(editor.state, MarkName.LINK);
  if(!isLinkMarkAttributes(attrs)) return null/*nothing to render*/;

  // Get the value of the mark from the actual attribute or the theme is not present
  const themeValue = getThemeValue(MarkName.LINK, AttributeType.TextColor);
  const inputValue = attrs[AttributeType.TextColor] ?? themeValue ?? '';

  // == Handler ===================================================================
  const handleChange = (value: string, focusEditor?: boolean) => {
    const { pos: prevPos } = editor.state.selection.$anchor;

    // Update mark attributes
    editor.chain()
          .extendMarkRange(MarkName.LINK)
          .setLink({ ...attrs, [AttributeType.TextColor]: value })
          .setTextSelection(prevPos)
          .run();

    // Focus the editor again
    if(focusEditor) editor.commands.focus();
  };

  // == UI ========================================================================
  return (
    <ColorPicker name='Color' value={inputValue} colors={textColors} onChange={handleChange} />
  );
};
