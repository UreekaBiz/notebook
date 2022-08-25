import { getRenderAttributes, AttributeType, DemoAsyncNodeAttributes, DemoAsyncNodeComponentJSX, DemoAsyncNodeRendererSpec, DemoAsyncNodeSpec, DemoAsyncNodeType, NodeName } from '@ureeka-notebook/web-service';

import { ReactNodeViewComponentProps } from 'notebookEditor/model/ReactNodeView';

import { DemoAsyncNodeModel } from './model';
import { DemoAsyncNodeView } from './view';

// @ts-ignore FIXME: DemoAsyncNodeModel doesn't seem to be compatible?
export type DemoAsyncNodeComponentProps = ReactNodeViewComponentProps<DemoAsyncNodeAttributes, DemoAsyncNodeType, DemoAsyncNodeModel, DemoAsyncNodeView>

export const DemoAsyncNodeComponent: React.FC<DemoAsyncNodeComponentProps> = ({ attrs, nodeModel, ContentDOMWrapper }) => {
  const id = attrs[AttributeType.Id];
  if(!id) return null/*nothing to render*/;

  const renderAttributes = getRenderAttributes(
    NodeName.CODEBLOCK,
    { ...attrs, codeBlockReferences: undefined, codeBlockHashes: undefined/*FIXME: Types!*/ },
    DemoAsyncNodeRendererSpec, DemoAsyncNodeSpec
  );
  const performingAsyncOperation = nodeModel.getPerformingAsyncOperation();
  const isDirty = nodeModel.getIsDirty();

  return (
    <DemoAsyncNodeComponentJSX
      performingAsyncOperation={performingAsyncOperation}
      isDirty={isDirty}
      attrs={attrs}
      renderAttributes={renderAttributes}
    />
  );
};
