import { MouseEventHandler } from 'react';

import { getRenderAttributes, AttributeType, CodeBlockReferenceAttributes, CodeBlockReferenceComponentJSX, CodeBlockReferenceNodeRendererSpec, CodeBlockReferenceNodeSpec, CodeBlockReferenceNodeType, NodeName } from '@ureeka-notebook/web-service';

import { focusCodeBlock } from 'notebookEditor/extension/codeblock/util';
import { ReactNodeViewComponentProps } from 'notebookEditor/model/ReactNodeView';

import { CodeBlockReferenceModel } from './model';
import { CodeBlockReferenceView } from './view';

// ********************************************************************************
// @ts-ignore FIXME: CodeBlockReferenceModel doesn't seem to be compatible?
export type CodeBlockReferenceComponentProps = ReactNodeViewComponentProps<CodeBlockReferenceAttributes, CodeBlockReferenceNodeType, CodeBlockReferenceModel, CodeBlockReferenceView>;

export const CodeBlockReferenceComponent: React.FC<CodeBlockReferenceComponentProps> = ({ attrs, nodeView, editor }) => {
  const id = attrs[AttributeType.Id];
  if(!id) return null/*nothing to render*/;

  const renderAttributes = getRenderAttributes(
    NodeName.CODEBLOCK_REFERENCE,
    { ...attrs, codeBlockReferences: undefined, codeBlockHashes: undefined/*FIXME: Types!*/ },
    CodeBlockReferenceNodeRendererSpec, CodeBlockReferenceNodeSpec
  );

  const visualId = nodeView.getReferencedVisualId();

  // == Handler ===================================================================
  const handleClick: MouseEventHandler<HTMLParagraphElement> = event => {
    if(!(event.metaKey || event.ctrlKey)) return/*do not focus referenced CodeBlock if Cmd/Ctrl not pressed*/;

    if(!visualId) return/*nothing to do*/;
    focusCodeBlock(editor, visualId);
  };

  // == UI ========================================================================
  return (
    <CodeBlockReferenceComponentJSX
      attrs={attrs}
      renderAttributes={renderAttributes}
      visualId={visualId}

      onClick={handleClick}
    />
  );
};
