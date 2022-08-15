import { Editor } from '@tiptap/core';

import { createNodeDataAttribute, getPosType, getRenderAttributes, getWrapStyles, AttributeType, CodeBlockNodeRendererSpec, CodeBlockNodeSpec, CodeBlockNodeType, CodeBlockType,  NodeName, DATA_VISUAL_ID } from '@ureeka-notebook/web-service';

import { AbstractNodeView } from 'notebookEditor/model/AbstractNodeView';

import { createCodeBlock } from '../ui';
import { CodeBlockModel } from './model';
import { CodeBlockStorage } from './storage';

// ********************************************************************************
export class CodeBlockView extends AbstractNodeView<CodeBlockNodeType, CodeBlockStorage, CodeBlockModel> {
  // The div that holds the paragraph holding the content of the CodeBlockView.
  // This is present since specific styles must be applied to the outer div
  // (this.dom), and the inner div (innerContainer). Its style determines whether
  // or not the text inside the CodeBlock is wrapped. Other NodeViews may specify
  // as much local elements as their view requires them to.
  private innerContainer: HTMLDivElement;

  // The paragraph where the text content of the codeBlock is rendered
  readonly contentDOM: HTMLElement;

  // == Lifecycle =================================================================
  public constructor(model: CodeBlockModel, editor: Editor, node: CodeBlockNodeType, codeBlockStorage: CodeBlockStorage, getPos: getPosType) {
    super(model, editor, node, codeBlockStorage, getPos);

    // .. UI ......................................................................
    // Create DOM elements and append it to the outer container (dom).
    const { innerContainer, paragraph } = createCodeBlock();
    this.innerContainer = innerContainer;
    this.dom.appendChild(this.innerContainer);

    // .. ProseMirror .............................................................
    // Tell PM that the content fo the node must go into the paragraph element,
    // by delegating keeping track of the it to PM (SEE: NodeView#contentDOM)
    this.contentDOM = paragraph;

    // Sync view with current state
    this.updateView();
  }

  /** @see AbstractNodeView#createDomElement() */
  protected createDomElement() {
    const outerContainer = document.createElement('div');
    return outerContainer;
  }

  // ..............................................................................
  /** @see AbstractNodeView#updateView() */
  public updateView() {
    const { attrs } = this.node;
    const id = attrs[AttributeType.Id],
          type = attrs[AttributeType.Type] ?? CodeBlockType.Code/*default*/,
          wrap = attrs[AttributeType.Wrap] ?? false/*default*/;

    // Update styles
    const renderAttributes = getRenderAttributes(NodeName.CODEBLOCK, attrs, CodeBlockNodeRendererSpec, CodeBlockNodeSpec);
    this.dom.setAttribute('style', renderAttributes.style ?? ''/*empty string if not defined*/);

    this.contentDOM.setAttribute('style', getWrapStyles(wrap));

    // Update visual id
    if(!id) return/*nothing to do*/;

    const visualId = this.storage.getVisualId(id);
    this.dom.setAttribute(DATA_VISUAL_ID, visualId);
    this.dom.setAttribute(createNodeDataAttribute(AttributeType.Type), type);
  }
}
