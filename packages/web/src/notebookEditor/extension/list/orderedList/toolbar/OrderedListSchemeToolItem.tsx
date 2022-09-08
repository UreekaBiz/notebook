import { isOrderedListNode, AttributeType, ListStyle } from '@ureeka-notebook/web-service';

import { DropdownTool } from 'notebookEditor/extension/shared/component/DropdownToolItem/DropdownTool';
import { InputToolItemContainer } from 'notebookEditor/extension/shared/component/InputToolItemContainer';
import { EditorToolComponentProps } from 'notebookEditor/toolbar/type';

import { getListNodesFromDepth } from '../../util';
import { updateListItemsInOrderedListCommand } from '../command';

// ********************************************************************************
export const OrderedListSchemeToolItem: React.FC<EditorToolComponentProps> = ({ editor, depth }) => {
  if(!depth) return null/*do not display, Lists must be nested*/;
  if(!editor.state.selection.empty) return null/*do not show on multiple Node Selection*/;

  const listNodesAtDepth = getListNodesFromDepth(editor.state, depth);
  if(!listNodesAtDepth) return null/*invalid depth*/;

  const { listAtDepth, listAtDepthPos, listItemAtDepth } = listNodesAtDepth;
  if(!isOrderedListNode(listAtDepth)) return null/*wrong List type*/;

  // == Handler ===================================================================
  const handleChange = (newValue: string) => {
    updateListItemsInOrderedListCommand(listAtDepth, listAtDepthPos, { [AttributeType.ListStyleType]: newValue })(editor.state, editor.view.dispatch);

    // NOTE: focusing the View immediately makes it detect Enter or
    //       Tab key presses. Hence, focus right after the update
    //       has been performed
    setTimeout(() => editor.view.focus()/*right after changes*/);
  };

  // == UI ===================================================================
  return (
    <InputToolItemContainer name='Scheme'>
      <DropdownTool
        value={listItemAtDepth.attrs[AttributeType.ListStyleType] ?? ListStyle.DECIMAL/*default*/}
        options={[{ value: ListStyle.DECIMAL, label: 'Decimal' }, { value: ListStyle.LOWER_ALPHA, label: 'Lower Alpha' }, { value: ListStyle.LOWER_ROMAN, label: 'Lower Roman' }]}
        placeholder='Type'
        onChange={handleChange}
      />
    </InputToolItemContainer>
  );
};

