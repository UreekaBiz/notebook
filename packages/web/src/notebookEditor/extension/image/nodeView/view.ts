import { Editor } from '@tiptap/core';

import { getPosType, AttributeType, NodeName, ImageNodeType, DEFAULT_IMAGE_BORDER_COLOR, DEFAULT_IMAGE_BORDER_STYLE, DEFAULT_IMAGE_BORDER_WIDTH, DEFAULT_IMAGE_CONTAINER_CLASS, DEFAULT_IMAGE_SRC, DEFAULT_IMAGE_ERROR_SRC, DATA_NODE_TYPE } from '@ureeka-notebook/web-service';

import { createInlineNodeContainer } from 'notebookEditor/extension/inlineNodeWithContent/util';
import { AbstractNodeView } from 'notebookEditor/model/AbstractNodeView';

import { ImageModel } from './model';
import { ImageStorage } from './storage';

// ********************************************************************************
// NOTE: this NodeView does not use React since TaskListItems do not have a
//       complex structure, nor do they require a Storage or an Id
export class ImageView extends AbstractNodeView<ImageNodeType, ImageStorage, ImageModel> {
  // == Attribute =================================================================
  // the HTML Image tag that displays this image
  private imageElement: HTMLImageElement;

  // the HTML Div tag that serves as a default placeholder and error state
  // display for the Node instead of the Image
  private divElement: HTMLDivElement;

  // == Lifecycle =================================================================
  public constructor(model: ImageModel, editor: Editor, node: ImageNodeType, imageStorage: ImageStorage, getPos: getPosType) {
    super(model, editor, node, imageStorage, getPos);

    // -- UI ----------------------------------------------------------------------
    const { imageElement, divElement } = this.createViewElements();
    this.imageElement = imageElement;
    this.divElement = divElement;

    this.dom.appendChild(this.divElement);
    this.dom.appendChild(this.imageElement);

    this.updateView();
  }

  // -- Creation ------------------------------------------------------------------
  protected createDomElement() {
    const inlineNodeContainer =  createInlineNodeContainer();
          inlineNodeContainer.setAttribute(DATA_NODE_TYPE, NodeName.IMAGE);

    return inlineNodeContainer;
  }

  // create the elements used by this Node with default styles
  private createViewElements() {
    const imageElement = document.createElement('img');

    const divElement = document.createElement('div');
          divElement.classList.add(DEFAULT_IMAGE_CONTAINER_CLASS);
    return { imageElement, divElement };
  }

  // -- Update --------------------------------------------------------------------
  public updateView(): void {
    super.updateView();
    this.syncView();
  }

  // ensure the Image DOM element has the latest attributes
  private syncView() {
    const { src, borderStyle, borderWidth, borderColor, width, height } = this.node.attrs;

    // if invalid src, show the default div
    if(!src || src === DEFAULT_IMAGE_SRC || src === DEFAULT_IMAGE_ERROR_SRC) {
      this.imageElement.style.display = ''/*default*/;
      this.divElement.style.display = 'auto';
      return/*no image to display*/;
    } /* else -- show the Image's content */

    this.divElement.style.display = ''/*default*/;
    this.imageElement.style.display = 'auto';
    this.imageElement.setAttribute(AttributeType.Src, src);

    // apply the styles to the DOM container
    width ? this.dom.style.width = width : this.dom.style.width = ''/*none*/;
    height ? this.dom.style.height = height : this.dom.style.height = ''/*none*/;
    borderColor ? this.dom.style.borderColor = borderColor : this.dom.style.borderColor = DEFAULT_IMAGE_BORDER_COLOR;
    borderStyle ? this.dom.style.borderStyle = borderStyle : this.dom.style.borderStyle = DEFAULT_IMAGE_BORDER_STYLE;
    borderWidth ? this.dom.style.borderWidth = borderWidth : this.dom.style.borderWidth = DEFAULT_IMAGE_BORDER_WIDTH;
  }
}
