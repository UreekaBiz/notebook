import { AttributeType, Margin, Padding } from '@ureeka-notebook/web-service';

import { getSelectedNode } from 'notebookEditor/extension/util/node';
import { EditorToolComponentProps } from 'notebookEditor/toolbar/type';

import { SpacingControls } from './SpacingControls';

// ********************************************************************************
interface Props extends EditorToolComponentProps {/*no additional*/}
export const SpacingToolItem: React.FC<Props> = ({ depth, editor }) => {
  const { state } = editor;
  const node = getSelectedNode(state, depth);
  if(!node) return null/*nothing to render*/;

  const { attrs } = node;

  const margin: Margin = {
    [AttributeType.MarginTop]: attrs[AttributeType.MarginTop],
    [AttributeType.MarginBottom]: attrs[AttributeType.MarginBottom],
    [AttributeType.MarginLeft]: attrs[AttributeType.MarginLeft],
    [AttributeType.MarginRight]: attrs[AttributeType.MarginRight],
  };

  const padding: Padding = {
    [AttributeType.PaddingTop]: attrs[AttributeType.PaddingTop],
    [AttributeType.PaddingBottom]: attrs[AttributeType.PaddingBottom],
    [AttributeType.PaddingLeft]: attrs[AttributeType.PaddingLeft],
    [AttributeType.PaddingRight]: attrs[AttributeType.PaddingRight],
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
