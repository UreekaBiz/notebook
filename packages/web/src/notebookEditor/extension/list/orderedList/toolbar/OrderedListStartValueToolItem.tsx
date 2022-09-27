import { isNumber, isOrderedListNode, AttributeType, ORDERED_LIST_DEFAULT_START } from '@ureeka-notebook/web-service';

import { InputTool } from 'notebookEditor/extension/shared/component/InputToolItem/InputTool';
import { InputToolItemContainer } from 'notebookEditor/extension/shared/component/InputToolItemContainer';
import { EditorToolComponentProps } from 'notebookEditor/sidebar/toolbar/type';

import { getListNodesFromDepth } from '../../util';
import { updateOrderedListCommand } from '../command';

// ********************************************************************************
export const OrderedListStartValueToolItem: React.FC<EditorToolComponentProps> = ({ editor, depth }) => {
  if(!depth) return null/*do not display, Lists must be nested*/;
  if(!editor.state.selection.empty) return null/*do not show on multiple Node Selection*/;

  const listNodesAtDepth = getListNodesFromDepth(editor.state, depth);
  if(!listNodesAtDepth) return null/*invalid depth*/;

  const { listAtDepth, listAtDepthPos } = listNodesAtDepth;
  if(!isOrderedListNode(listAtDepth)) return null/*wrong List type*/;

  // == Handler ===================================================================
  const handleChange = (newValue: string) => {
    if(!isNumber(newValue)) return;
    updateOrderedListCommand(listAtDepthPos, { [AttributeType.StartValue]: Number(newValue) })(editor.state, editor.view.dispatch);

    // NOTE: focusing the View immediately makes it detect Enter or
    //       Tab key presses. Hence, focus right after the update
    //       has been performed
    setTimeout(() => editor.view.focus()/*right after changes*/);
  };

  // == UI ========================================================================
  const value = listAtDepth.attrs[AttributeType.StartValue] ?? ORDERED_LIST_DEFAULT_START/*default*/;
  return (
    <InputToolItemContainer name={'Start Value'}>
      <InputTool
        value={value.toString()}
        placeholder='Start Value'
        onChange={handleChange}
      />
    </InputToolItemContainer>
  );
};
