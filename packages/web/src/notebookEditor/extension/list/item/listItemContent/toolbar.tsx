import { AttributeType, NodeName } from '@ureeka-notebook/web-service';

import { ColorPickerNodeToolItem } from 'notebookEditor/extension/shared/component/ColorPickerToolItem';
import { shouldShowToolItem } from 'notebookEditor/shared/toolItem';
import { ToolItem } from 'notebookEditor/sidebar/toolbar/type';

// ********************************************************************************
// == ToolItem ====================================================================
export const listItemContentBackgroundColorToolItem: ToolItem = {
  toolType: 'component',
  name: 'listItemContentBackgroundColorToolItem',

  component: ({ editor, depth }) =>
    <ColorPickerNodeToolItem
      editor={editor}
      depth={depth ? depth+1/*account for ListItem ancestor*/ : depth/*do not specify*/}
      nodeName={NodeName.LIST_ITEM_CONTENT}
      attributeType={AttributeType.BackgroundColor}
      name='Background Color'
    />,
    shouldShow: (editor, depth) => shouldShowToolItem(editor, depth),
  };

// == Toolbar =====================================================================
// currently none
