import { Node as ProseMirrorNode } from 'prosemirror-model';

import { nodeToTagId } from '@ureeka-notebook/web-service';

// ********************************************************************************
// == Common Element ==============================================================
export const createTextSpan = (node: ProseMirrorNode, innerHTML: string) => {
  const textSpan = document.createElement('span');
        textSpan.setAttribute('id', nodeToTagId(node));
        textSpan.innerHTML = innerHTML;
  return textSpan;
};
