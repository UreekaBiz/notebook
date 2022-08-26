import { getMarkAttributes } from '@tiptap/core';

import { extendMarkRangeCommand, getThemeValue, isLinkMarkAttributes, setTextSelectionCommand, AttributeType, MarkName } from '@ureeka-notebook/web-service';

import { ColorPickerTool } from 'notebookEditor/extension/shared/component/ColorPickerToolItem/ColorPickerTool';
import { EditorToolComponentProps } from 'notebookEditor/toolbar/type';

import { setLinkCommand } from '../../command';

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
  const handleChange = (value: string) => {
    const { schema } = editor.state;
    const { dispatch } = editor.view;
    const { anchor: prevPos } = editor.state.selection;

    extendMarkRangeCommand(schema, MarkName.LINK, {/*no attributes*/})(editor.state/*current state*/, dispatch);
    setLinkCommand({ ...attrs, [AttributeType.TextColor]: value })(editor.state/*current state*/, dispatch);
    setTextSelectionCommand({ from: prevPos, to: prevPos })(editor.state/*current state*/, dispatch);

    editor.view.focus();
  };

  // == UI ========================================================================
  return (
    <ColorPickerTool name='Color' value={inputValue} onChange={handleChange} />
  );
};
