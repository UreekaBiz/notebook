import { Editor } from '@tiptap/core';

import { getNestedViewNodeTextString, getPosType, NestedViewBlockNodeType, NESTED_VIEW_NODE_EMPTY_NODE_CLASS } from '@ureeka-notebook/web-service';

import { AbstractNestedViewNodeView } from 'notebookEditor/extension/nestedViewNode/nodeView/view';

import { NestedViewBlockNodeModel } from './model';
import { NestedViewBlockNodeStorageType } from './controller';

// ********************************************************************************
export class NestedViewBlockNodeView extends AbstractNestedViewNodeView<NestedViewBlockNodeType, NestedViewBlockNodeStorageType, NestedViewBlockNodeModel> {
  // == Lifecycle =================================================================
  public constructor(model: NestedViewBlockNodeModel, editor: Editor, node: NestedViewBlockNodeType, storage: NestedViewBlockNodeStorageType, getPos: getPosType) {
    super(model, editor, node, storage, getPos);

    // currently nothing else required
  }

  // NOTE: matches the renderNodeContent behavior of the EditableInlineNodeWithContent
  // display the contents of the inner View as a Block showing their length
  public renderNodeContent(): void {
    if(!this.renderDisplayContainer) return/*not set yet, nothing to do*/;

		// get text string to render
    const textString = getNestedViewNodeTextString(this.node);
		if(textString.length < 1) {
			this.dom.classList.add(NESTED_VIEW_NODE_EMPTY_NODE_CLASS);

			// clear rendered DOM Nodes, since this Node is in an invalid state
			while(this.renderDisplayContainer.firstChild){
        this.renderDisplayContainer.firstChild.remove();
      }
      return/*nothing left to do*/;
		} /* else -- not empty */

    this.dom.classList.remove(NESTED_VIEW_NODE_EMPTY_NODE_CLASS);

    // show the default representation of the content of this Node
    this.renderDisplayContainer.firstChild?.remove();
    const newRenderDisplayChild = document.createElement('span');
          newRenderDisplayChild.innerHTML = `Length: ${textString.length}`;
    this.renderDisplayContainer.appendChild(newRenderDisplayChild);
  }
}
