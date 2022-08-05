import { nodeToTagId, AttributeType, DemoAsyncNodeType } from '@ureeka-notebook/web-service';

// ********************************************************************************
// == Common Element ==============================================================
export const createTextSpan = (node: DemoAsyncNodeType) => {
  const textSpan = document.createElement('span');
  textSpan.setAttribute('id', nodeToTagId(node));
  textSpan.innerHTML = node.attrs[AttributeType.Text] ?? ''/*default none*/;
  return textSpan;
};
