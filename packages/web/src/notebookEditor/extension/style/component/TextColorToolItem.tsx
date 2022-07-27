import { AttributeType, InvalidMergedAttributeValue, MarkName } from '@ureeka-notebook/web-service';

import { ColorPicker } from 'notebookEditor/extension/style/component/ColorPicker';
import { getTextDOMRenderedValue  } from 'notebookEditor/extension/util/attribute';
import { getSelectedNode } from 'notebookEditor/extension/util/node';
import { textColors } from 'notebookEditor/theme/type';
import { EditorToolComponentProps } from 'notebookEditor/toolbar/type';

// ********************************************************************************
interface Props extends EditorToolComponentProps {/*no additional*/}
export const TextColorToolItem: React.FC<Props> = ({ editor, depth }) => {
  const { state } = editor;
  const node = getSelectedNode(state, depth);
  if(!node) return null/*nothing to render*/;

  const domRenderValue = getTextDOMRenderedValue(editor, AttributeType.TextColor, MarkName.TEXT_STYLE);
  const inputValue = domRenderValue === InvalidMergedAttributeValue ? '' : domRenderValue;

  // == Handlers ==================================================================
  const handleChange = (value: string) => {
    editor.commands.setTextStyle(AttributeType.TextColor, value);

    // Focus the editor again
    editor.commands.focus();
  };

  // == UI ========================================================================
  return (
    <ColorPicker name='Color' value={inputValue ?? ''} colors={textColors} onChange={handleChange} />
  );
};
