import { getSelectedNode, isDemo2AsyncNode, AttributeType, NodeName } from '@ureeka-notebook/web-service';

import { SliderTool } from 'notebookEditor/extension/shared/component/SliderToolItem/SliderTool';
import { EditorToolComponentProps } from 'notebookEditor/toolbar/type';

// ********************************************************************************
// == Constants ===================================================================
const SLIDER_MARK_VALUES = [{ value: 25, label: '2.5' }, { value: 50, label: '5' }, { value: 75, label: '7.5' }];

// == Component ===================================================================
interface Props extends EditorToolComponentProps {/*no additional*/ }
export const Demo2AsyncNodeDelaySlider: React.FC<Props> = ({ editor, depth }) => {
  const { state } = editor;
  const node = getSelectedNode(state, depth);
  if(!node || !isDemo2AsyncNode(node))  return null /*nothing to render - invalid DemoAsyncNodeSlider render*/;

  // == Handler ===================================================================
  const handleChange = (value: number) => {
    editor.commands.updateAttributes(NodeName.DEMO_2_ASYNC_NODE, { delay: value * 100/*turns sliderValue to ms*/ });

    // Focus the editor again
    editor.commands.focus();
  };

  // == UI ========================================================================
  const value = node.attrs[AttributeType.Delay] ?? 0 /*default*/;
  return (
    <SliderTool
      name='Delay'
      value={value / 100/*turns ms to sliderValue*/}
      step={10}
      sliderMarkValues={SLIDER_MARK_VALUES}
      onChange={handleChange}
    />
  );
};
