import { getMarkAttributes } from '@tiptap/core';

import { getThemeValue, isLinkMarkAttributes, AttributeType, MarkName, ExtendMarkRangeDocumentUpdate, SetTextSelectionDocumentUpdate } from '@ureeka-notebook/web-service';

import { applyDocumentUpdates } from 'notebookEditor/command/update';
import { ColorPickerTool } from 'notebookEditor/extension/shared/component/ColorPickerToolItem/ColorPickerTool';
import { EditorToolComponentProps } from 'notebookEditor/sidebar/toolbar/type';

import { SetLinkDocumentUpdate } from '../../command';

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
    const { anchor: prevPos } = editor.state.selection;

    applyDocumentUpdates(editor, [
      new ExtendMarkRangeDocumentUpdate(MarkName.LINK, {/*no attributes*/}),
      new SetLinkDocumentUpdate({ ...attrs, [AttributeType.TextColor]: value }),
      new SetTextSelectionDocumentUpdate({ from: prevPos, to: prevPos }),
    ]);

    editor.view.focus();
  };

  // == UI ========================================================================
  return (
    <ColorPickerTool name='Color' value={inputValue} onChange={handleChange} />
  );
};
