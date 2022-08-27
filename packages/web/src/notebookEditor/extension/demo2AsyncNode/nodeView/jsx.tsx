import { getRenderAttributes, AttributeType, Demo2AsyncNodeAttributes, Demo2AsyncNodeComponentJSX, Demo2AsyncNodeRendererSpec, Demo2AsyncNodeSpec, Demo2AsyncNodeType, NodeName } from '@ureeka-notebook/web-service';

import { ReactNodeViewComponentProps } from 'notebookEditor/model/ReactNodeView';

import { Demo2AsyncNodeModel } from './model';
import { Demo2AsyncNodeView } from './view';

// ********************************************************************************
// @ts-ignore FIXME: Demo2AsyncNodeModel doesn't seem to be compatible?
export type Demo2AsyncNodeComponentProps = ReactNodeViewComponentProps<Demo2AsyncNodeAttributes, Demo2AsyncNodeType, Demo2AsyncNodeModel, Demo2AsyncNodeView>

export const Demo2AsyncNodeComponent: React.FC<Demo2AsyncNodeComponentProps> = ({ attrs, nodeModel, ContentDOMWrapper }) => {
  const id = attrs[AttributeType.Id];
  if(!id) return null/*nothing to render*/;

  const renderAttributes = getRenderAttributes(NodeName.DEMO_2_ASYNC_NODE, { ...attrs, wrap: undefined/*FIXME: Types!*/ }, Demo2AsyncNodeRendererSpec, Demo2AsyncNodeSpec);
  const performingAsyncOperation = nodeModel.getPerformingAsyncOperation();

  return (
    <Demo2AsyncNodeComponentJSX
      performingAsyncOperation={performingAsyncOperation}
      attrs={attrs}
      renderAttributes={renderAttributes}
    >
      {ContentDOMWrapper}
    </Demo2AsyncNodeComponentJSX>
  );
};
