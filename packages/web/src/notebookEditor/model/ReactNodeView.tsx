import { Editor } from '@tiptap/core';
import { Node as ProseMirrorNode } from 'prosemirror-model';
import React, { useEffect, useRef, ReactElement } from 'react';

import { Attributes } from '@ureeka-notebook/web-service';

import { AbstractNodeModel } from './AbstractNodeModel';
import { AbstractNodeView } from './AbstractNodeView';

// ********************************************************************************
// == Type ========================================================================
export type ReactNodeViewProps<
  Attrs extends Attributes,
  NodeType extends ProseMirrorNode,
  NodeModel extends AbstractNodeModel<NodeType, any>,
  NodeView extends AbstractNodeView<NodeType, any, NodeModel>,
  > = {
  /** the editor that this Node belongs to */
  editor: Editor;

  /** the attributes of the node */
  attrs: Attrs;
  /** the nodes that this View corresponds to */
  node: NodeType & Attrs;

  /** the corresponding model for the view */
  nodeModel: NodeModel;
  /** the node view */
  nodeView: NodeView;

  /** wether the node is selected or not */
  isSelected: boolean;
};

export type ReactNodeViewComponentProps<
  A extends Attributes,
  N extends ProseMirrorNode,
  M extends AbstractNodeModel<N, any>,
  V extends AbstractNodeView<N, any, M>,
> = ReactNodeViewProps<A, N, M, V> & {
  /** the React element that wraps the contentDOM */
  ContentDOMWrapper: ReactElement;
};

export type WrapReactNodeViewOptions = {
  /** the tag used to render the content wrapper. Defaults to 'div' */
  contentDOMWrapperTag?: React.ElementType;
}

// ================================================================================
/**
 * Utility function that wraps a ReactNodeView in a React component that can be
 * used to display the content of the node.
 *
 * @param contentDOM an optional HTMLElement that holds the editable content for
 *                   the Node. This element is handled by Prosemirror and the NodeView
 *                   can decide how to render it.
 * @param props the props for the React component
 * @param component the actual component that will render the view.
 * @param options an object of {@link WrapReactNodeViewOptions}.
 */
export const WrapReactNodeView = <
  A extends Attributes,
  N extends ProseMirrorNode = any,
  M extends AbstractNodeModel<N, any> = any,
  V extends AbstractNodeView<N, M, any> = any,
> (
  contentDOM: HTMLElement | null | undefined,
  props: ReactNodeViewProps<A, N, M, V>, component: (props: ReactNodeViewComponentProps<A, N, M, V>) => ReactElement,
  options?: WrapReactNodeViewOptions
) => {
  // creates a ref that points to the contentDOM
  const ref = useRef<HTMLElement>(null);

  // == Effect ====================================================================
  // appends the content into the ContentDOMWrapper
  useEffect(() => {
    const ContentDOMWrapper = ref.current;
    if(!ContentDOMWrapper || !contentDOM) return/*nothing to do*/;
    ContentDOMWrapper.appendChild(contentDOM);

    return () => { ContentDOMWrapper.removeChild(contentDOM); };
  }, [contentDOM]);

  // == Rendering =================================================================
  const ContentDOMWrapperTag = options?.contentDOMWrapperTag ?? 'div' /*by contract*/;
  const ContentDOMWrapper = <ContentDOMWrapperTag data-node-view-content-dom-wrapper ref={ref} />;

  // render the component with the and the ContentDOMWrapper
  return component({ ...props, ContentDOMWrapper });
};
