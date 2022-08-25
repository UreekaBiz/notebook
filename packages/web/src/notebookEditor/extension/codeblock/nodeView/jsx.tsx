import { AttributeType, CodeBlockAttributes, CodeBlockComponentJSX, CodeBlockNodeRendererSpec, CodeBlockNodeSpec, CodeBlockNodeType, getRenderAttributes, NodeName } from '@ureeka-notebook/web-service';

import { ReactNodeViewComponentProps } from 'notebookEditor/model/ReactNodeView';

import { CodeBlockModel } from './model';
import { CodeBlockView } from './view';

export type CodeBlockComponentProps = ReactNodeViewComponentProps<CodeBlockAttributes, CodeBlockNodeType, CodeBlockModel, CodeBlockView>

export const CodeBlockComponent: React.FC<CodeBlockComponentProps> = ({ attrs, nodeView, ContentDOMWrapper }) => {
  const id = attrs[AttributeType.Id];


  if(!id) return null/*nothing to render*/;

  const visualId = nodeView.storage.getVisualId(id);
  const renderAttributes = getRenderAttributes(NodeName.CODEBLOCK, { ...attrs, wrap: undefined/*FIXME: Types!*/ }, CodeBlockNodeRendererSpec, CodeBlockNodeSpec);

  return <CodeBlockComponentJSX visualId={visualId} attrs={attrs} renderAttributes={renderAttributes}>{ContentDOMWrapper}</CodeBlockComponentJSX>;
};
