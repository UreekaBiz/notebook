import { isDemo2AsyncNode, AttributeType, NodeName } from '@ureeka-notebook/service-common';

import { ExecuteAsyncNodeButton } from 'notebookEditor/extension/asyncNode/component/ExecuteAsyncNodeButton';
import { getNodeViewStorage } from 'notebookEditor/model/NodeViewStorage';
import { EditorToolComponentProps } from 'notebookEditor/toolbar/type';

import { Demo2AsyncNodeStorageType } from '../nodeView/controller';

// ********************************************************************************
interface Props extends EditorToolComponentProps {/*no additional*/ }
export const ExecuteDemo2AsyncNodeButton: React.FC<Props> = ({ editor }) => {
  const parentNode = editor.state.selection.$anchor.parent;
  if(!isDemo2AsyncNode(parentNode)) return null/*nothing to render -- silently fail*/;

  const id = parentNode.attrs[AttributeType.Id];
  if(!id) return null/*nothing to render -- silently fail*/;

  const demo2AsyncNodeViewStorage = getNodeViewStorage<Demo2AsyncNodeStorageType>(editor, NodeName.DEMO_2_ASYNC_NODE),
        demo2AsyncNodeView = demo2AsyncNodeViewStorage.getNodeView(id);
  if(!demo2AsyncNodeView) return null/*nothing to render -- silently fail*/;

  const disabled = !(demo2AsyncNodeView.node.attrs.textToReplace && demo2AsyncNodeView.node.attrs.textToReplace.length > 0) ||
                    (demo2AsyncNodeView.node.textContent.length < 1);

  return (
    <ExecuteAsyncNodeButton
      editor={editor}
      asyncNodeView={demo2AsyncNodeView}
      disabled={disabled}
    />
  );
};
