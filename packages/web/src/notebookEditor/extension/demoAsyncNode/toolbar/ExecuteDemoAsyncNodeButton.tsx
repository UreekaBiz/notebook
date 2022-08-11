import { isDemoAsyncNode, AttributeType, NodeName, REMOVED_CODEBLOCK_VISUALID } from '@ureeka-notebook/web-service';

import { ExecuteAsyncNodeButton } from 'notebookEditor/extension/asyncNode/component/ExecuteAsyncNodeButton';
import { visualIdFromCodeBlockReference } from 'notebookEditor/extension/codeBlockReference/util';
import { getSelectedNode } from 'notebookEditor/extension/util/node';
import { getNodeViewStorage } from 'notebookEditor/model/NodeViewStorage';
import { EditorToolComponentProps } from 'notebookEditor/toolbar/type';

import { DemoAsyncNodeStorageType } from '../nodeView/controller';

// ********************************************************************************
interface Props extends EditorToolComponentProps {/*no additional*/ }
export const ExecuteDemoAsyncNodeButton: React.FC<Props> = ({ editor }) => {
  const node = getSelectedNode(editor.state);
  if(!node || !isDemoAsyncNode(node)) return null/*nothing to render -- silently fail*/;
  const { attrs } = node;

  const id = attrs[AttributeType.Id],
        codeBlockReferences = attrs[AttributeType.CodeBlockReferences] ?? []/*default*/;
  if(!id) return null/*nothing to render -- silently fail*/;

  const demoAsyncNodeViewStorage = getNodeViewStorage<DemoAsyncNodeStorageType>(editor, NodeName.DEMO_ASYNC_NODE),
        demoAsyncNodeView = demoAsyncNodeViewStorage.getNodeView(id);
  if(!demoAsyncNodeView) return null/*nothing to render -- silently fail*/;

  const disabled = codeBlockReferences.length < 1
                || codeBlockReferences.some((reference) => visualIdFromCodeBlockReference(editor, reference) === REMOVED_CODEBLOCK_VISUALID)
                || demoAsyncNodeView.nodeModel.getPerformingAsyncOperation();

  return (
    <ExecuteAsyncNodeButton
      editor={editor}
      asyncNodeView={demoAsyncNodeView}
      disabled={disabled}
    />
  );
};
