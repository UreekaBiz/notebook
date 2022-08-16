import { Node as ProseMirrorNode } from 'prosemirror-model';

import { nodeToTagId } from '@ureeka-notebook/web-service';

// ********************************************************************************
// == Common Element ==============================================================
export const createTextSpan = (node: ProseMirrorNode, innerText: string) => {
  const textSpan = document.createElement('span');
        textSpan.setAttribute('id', nodeToTagId(node));
        textSpan.innerText = innerText;
  return textSpan;
};
