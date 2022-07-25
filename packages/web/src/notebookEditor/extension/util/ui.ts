import { INLINE_NODE_CONTAINER_CLASS } from 'notebookEditor/theme/theme';

// ********************************************************************************
/**
 * Creates an inline {@link HTMLSpanElement} with the required
 * attributes that enable it to correctly display an inline node with content
 */
export const createInlineNodeContainer = (): HTMLSpanElement => {
  const inlineContainer = document.createElement('span');
        inlineContainer.classList.add(INLINE_NODE_CONTAINER_CLASS);
        inlineContainer.setAttribute('contentEditable', 'false');

  return inlineContainer;
};
