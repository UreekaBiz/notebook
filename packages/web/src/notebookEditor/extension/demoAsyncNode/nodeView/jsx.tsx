import { getRenderAttributes, AttributeType, DemoAsyncNodeAttributes, DemoAsyncNodeComponentJSX, DemoAsyncNodeRendererSpec, DemoAsyncNodeSpec, DemoAsyncNodeType, NodeName } from '@ureeka-notebook/web-service';

import { ReactNodeViewComponentProps } from 'notebookEditor/model/ReactNodeView';

import { DemoAsyncNodeModel } from './model';
import { DemoAsyncNodeView } from './view';

// ********************************************************************************
// @ts-ignore FIXME: DemoAsyncNodeModel doesn't seem to be compatible?
export type DemoAsyncNodeComponentProps = ReactNodeViewComponentProps<DemoAsyncNodeAttributes, DemoAsyncNodeType, DemoAsyncNodeModel, DemoAsyncNodeView>;

export const DemoAsyncNodeComponent: React.FC<DemoAsyncNodeComponentProps> = ({ attrs, nodeModel, ContentDOMWrapper, isSelected }) => {
  const id = attrs[AttributeType.Id];
  if(!id) return null/*nothing to render*/;

  const renderAttributes = getRenderAttributes(
    NodeName.DEMO_ASYNC_NODE,
    { ...attrs, codeBlockReferences: undefined, codeBlockHashes: undefined/*FIXME: Types!*/ },
    DemoAsyncNodeRendererSpec, DemoAsyncNodeSpec
  );
  const performingAsyncOperation = nodeModel.getPerformingAsyncOperation();
  const isDirty = nodeModel.getIsDirty();

  // == UI ========================================================================
  return (
    <DemoAsyncNodeComponentJSX
      isEditor
      attrs={attrs}
      renderAttributes={renderAttributes}
      performingAsyncOperation={performingAsyncOperation}
      isDirty={isDirty}
      isSelected={isSelected}
    />
  );
};
