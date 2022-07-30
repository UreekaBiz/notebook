import { AttributeType, Margin, Padding } from '@ureeka-notebook/web-service';

import { getTextDOMRenderedValue } from 'notebookEditor/extension/util/attribute';
import { getSelectedNode } from 'notebookEditor/extension/util/node';
import { Unit } from 'notebookEditor/theme/type';
import { EditorToolComponentProps } from 'notebookEditor/toolbar/type';

import { SpacingControls } from './SpacingControls';

// Value used when there is no value defined withing the node or the Theme.
const DEFAULT_VALUE = `0${Unit.Pixel}`;

// ********************************************************************************
interface Props extends EditorToolComponentProps {/*no additional*/}
export const SpacingToolItem: React.FC<Props> = ({ depth, editor }) => {
  const { state } = editor;
  const node = getSelectedNode(state, depth);
  if(!node) return null/*nothing to render*/;

  const margin: Margin = {
    [AttributeType.MarginTop]: getTextDOMRenderedValue(editor, AttributeType.MarginTop) ?? DEFAULT_VALUE,
    [AttributeType.MarginBottom]: getTextDOMRenderedValue(editor, AttributeType.MarginBottom) ?? DEFAULT_VALUE,
    [AttributeType.MarginLeft]: getTextDOMRenderedValue(editor, AttributeType.MarginLeft) ?? DEFAULT_VALUE,
    [AttributeType.MarginRight]: getTextDOMRenderedValue(editor, AttributeType.MarginRight) ?? DEFAULT_VALUE,
  };

  const padding: Padding = {
    [AttributeType.PaddingTop]: getTextDOMRenderedValue(editor, AttributeType.PaddingTop) ?? DEFAULT_VALUE,
    [AttributeType.PaddingBottom]: getTextDOMRenderedValue(editor, AttributeType.PaddingBottom) ?? DEFAULT_VALUE,
    [AttributeType.PaddingLeft]: getTextDOMRenderedValue(editor, AttributeType.PaddingLeft) ?? DEFAULT_VALUE,
    [AttributeType.PaddingRight]: getTextDOMRenderedValue(editor, AttributeType.PaddingRight) ?? DEFAULT_VALUE,
  };

  // == Handlers ==================================================================
  const handleChange = (attribute: AttributeType, value: string) => {
    editor.commands.setStyle(attribute, value, depth);
  };

  // == UI ========================================================================
  return (
    <SpacingControls margin={margin} padding={padding} name='Spacing' onChange={handleChange} />
  );
};
