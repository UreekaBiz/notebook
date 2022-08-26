import { getSelectedNode, isNodeSelection, updateAttributesInRangeCommand, AttributeType, Margin, Padding } from '@ureeka-notebook/web-service';

import { getTextDOMRenderedValue } from 'notebookEditor/extension/util/attribute';
import { Unit } from 'notebookEditor/theme/type';
import { EditorToolComponentProps } from 'notebookEditor/toolbar/type';

import { SpacingControls } from './SpacingControls';

// Value used when there is no value defined withing the node or the Theme.
const DEFAULT_VALUE = `0${Unit.Pixel}`;

// ********************************************************************************
interface Props extends EditorToolComponentProps {/*no additional*/}
export const SpacingToolItem: React.FC<Props> = ({ depth, editor }) => {
  const { state } = editor;
  const { selection } = state;
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

  // == Handler ===================================================================
  const handleChange = (attribute: AttributeType, value: string) => {
    updateAttributesInRangeCommand(attribute, value, depth)(editor.state, editor.view.dispatch);

    const position = state.selection.anchor;
    // set the selection in the same position in case that the node was replaced
    if(isNodeSelection(selection)) editor.commands.setNodeSelection(position);
    else editor.commands.setTextSelection(position);

    // Focus the editor again
    editor.commands.focus();
  };

  // == UI ========================================================================
  return (
    <SpacingControls margin={margin} padding={padding} name='Spacing' onChange={handleChange} />
  );
};
