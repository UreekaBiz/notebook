import { Editor } from '@tiptap/core';

import { getPosType, CodeBlockNodeType } from '@ureeka-notebook/web-service';

import { AbstractNodeView } from 'notebookEditor/model/AbstractNodeView';
import { WrapReactNodeView } from 'notebookEditor/model/ReactNodeView';

import { CodeBlockComponent, CodeBlockComponentProps } from './jsx';
import { CodeBlockModel } from './model';
import { CodeBlockStorage } from './storage';

// ********************************************************************************
export class CodeBlockView extends AbstractNodeView<CodeBlockNodeType, CodeBlockStorage, CodeBlockModel> {
  // == Lifecycle =================================================================
  public constructor(model: CodeBlockModel, editor: Editor, node: CodeBlockNodeType, codeBlockStorage: CodeBlockStorage, getPos: getPosType) {
    super(model, editor, node, codeBlockStorage, getPos);

    // .. UI ......................................................................
    // Create DOM elements and append it to the outer container (dom).
    const contentDOM = document.createElement('div');
    this.contentDOM = contentDOM;

    this.reactNodeView = (props) => WrapReactNodeView(
      contentDOM,
      props,
      // FIXME: Types!
      (props) => <CodeBlockComponent {...props as unknown as CodeBlockComponentProps} />,
      {/*no options*/}
    );

    // Sync view with current state
    this.updateView();
  }

  /** @see AbstractNodeView#createDomElement() */
  protected createDomElement() { return document.createElement('div'); }
}
