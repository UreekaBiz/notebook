import { INLINE_NODE_CONTAINER_CLASS } from '@ureeka-notebook/web-service';

// ********************************************************************************
/**
 * Creates an inline {@link HTMLSpanElement} with the required
 * attributes that enable it to correctly display an inline node with content
 */
 export const createInlineNodeContainer = (): HTMLSpanElement => {
  const inlineContainer = document.createElement('span');
        inlineContainer.classList.add(INLINE_NODE_CONTAINER_CLASS);
        inlineContainer.setAttribute('contentEditable', 'false');

  // NOTE: the draggable prop in a NodeSpec only refers to when the Node
  //       is not selected (i.e. if selected) it is still draggable. The
  //       following prevent that from happening
        inlineContainer.ondragstart = () => false;
        inlineContainer.ondrop = () => false;
        inlineContainer.draggable = false;

  return inlineContainer;
};
