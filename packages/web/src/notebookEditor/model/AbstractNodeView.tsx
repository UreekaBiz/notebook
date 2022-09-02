import { Editor } from '@tiptap/core';
import { Node as ProseMirrorNode } from 'prosemirror-model';
import { ReactElement } from 'react';
import * as ReactDOM from 'react-dom/client';

import { getPosType, HTMLAttributes } from '@ureeka-notebook/web-service';

import { NoStorage } from './type';
import { AbstractNodeController } from './AbstractNodeController';
import { AbstractNodeModel } from './AbstractNodeModel';
import { NodeViewStorage } from './NodeViewStorage';
import { ReactNodeViewComponentProps, ReactNodeViewProps } from './ReactNodeView';

// Abstract class renders the corresponding DOM nodes for a NodeController
// SEE: {@link AbstractNodeController}
// ********************************************************************************
export abstract class AbstractNodeView<NodeType extends ProseMirrorNode, Storage extends NodeViewStorage<AbstractNodeController<NodeType, any, any, any>> | NoStorage, NodeModel extends AbstractNodeModel<NodeType, Storage>> {
  // the outer DOM node that represents the Document Node
  public readonly dom: HTMLElement;

  // the DOM node that holds the Node's content. Only meaningful if its Node is not
  // a leaf Node type. When this is present, ProseMirror will take care of rendering
  // the Node's children into it. When it is not present, the Node View itself is
  // responsible for rendering (or deciding not to render) its child Nodes
  public contentDOM?: HTMLElement | null | undefined;

  // container that renderers the specified reactComponent. The specified root is
  // the same as the #dom property.
  public ReactRoot: ReactDOM.Root;
  // a react component that will be used to render the view of the Node. This
  // component is meant to be used wrapped inside a WrapReactNodeView.
  // SEE: ReactNodeView.ts
  public reactNodeView?: <A extends HTMLAttributes>(props: ReactNodeViewProps<A, NodeType, NodeModel, any/*FIXME: types*/>) => ReactElement<ReactNodeViewComponentProps<A, NodeType, NodeModel, typeof this>>;

  // ------------------------------------------------------------------------------
  // the corresponding model for this view.
  readonly model: NodeModel;

  // ==============================================================================
  readonly editor: Editor;
  public node: NodeType;
  readonly storage: Storage;
  getPos: getPosType;

  // == Life-Cycle ================================================================
  public constructor(model: NodeModel, editor: Editor, node: NodeType, storage: Storage, getPos: getPosType) {
    this.editor = editor;
    this.node = node;
    this.storage = storage;
    this.getPos = getPos;

    this.model = model;

    // Creates the outer DOM node.
    this.dom = this.createDomElement();

    // Creates the React root.
    this.ReactRoot = ReactDOM.createRoot(this.dom);
  }

  // Sync getPos and node when prosemirror updates it
  public updateProps(getPos: getPosType) {
    this.getPos = getPos;
  }

  // called by the Controller when the NodeView's Node is removed.
  // This method is meant to be used to perform view-specific
  // functionality on Node removal (e.g. removing EventListeners).
  // The destruction of the View elements themselves is
  // handled by default by ProseMirror
  public destroy() {/*currently nothing*/}

  // == View ======================================================================
  // creates the outer DOM node that represents the Document Node
  protected abstract createDomElement(): HTMLElement;

  // updates the DOM node that represents the Node
  // NOTE: sub classes implementing this method should call super.update() since it
  //       update the reactNodeView.
  // NOTE: this method needs to be public since its render view could depend on
  //       an external state (e.g. the visualId of the CodeBlockView) and thus
  //       needs to be called from outside the class.
  public updateView() {
    if(this.reactNodeView) {
      const props: ReactNodeViewProps<any/*cannot know attributes at this level*/, NodeType, NodeModel, typeof this> = {
        attrs: this.node.attrs,
        editor: this.editor,
        node: this.node,
        nodeModel: this.model,
        nodeView: this,
        isSelected: this.model.getSelected(),
      };
      // set data-node-view attribute
      // SEE: index.css
      this.dom.setAttribute('data-node-view', 'true');

      // Update React View
      // NOTE: A react component is meant to be rendered using JSX instead of
      //       calling the function directly since this mess ups the order of the
      //       hooks causing the problem "React has detected a change in the order
      //       of Hooks". To avoid this a valid component is created from the same
      //       function.
      const ReactNodeViewComponent = this.reactNodeView;
      this.ReactRoot.render(<ReactNodeViewComponent {...props} />);
    }
  }
}
