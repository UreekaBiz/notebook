import { getMarkAttributes } from '@tiptap/core';

import { getThemeValue, isLinkMarkAttributes, AttributeType, MarkName } from '@ureeka-notebook/web-service';

import { ColorPickerTool } from 'notebookEditor/extension/shared/component/ColorPickerToolItem/ColorPickerTool';
import { EditorToolComponentProps } from 'notebookEditor/toolbar/type';

// ********************************************************************************
interface Props extends EditorToolComponentProps {/*no additional*/}
// NOTE: Using custom ToolItem Component instead of using the ColorPickerInputToolItem
//       since the Link must be updated with custom meta tags and cannot work with
//       default behavior.
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
    <ColorPickerTool name='Color' value={inputValue} onChange={handleChange} />
  );
};
