import { Editor } from '@tiptap/core';

import { getPosType, isBlank, AttributeType, NodeName, ImageNodeType, DEFAULT_IMAGE_BORDER_COLOR, DATA_NODE_TYPE, DEFAULT_IMAGE_BORDER_STYLE, DEFAULT_IMAGE_BORDER_WIDTH, DEFAULT_IMAGE_ERROR_SRC, DEFAULT_IMAGE_SRC, DEFAULT_IMAGE_WIDTH, DEFAULT_IMAGE_HEIGHT, IMAGE_ERROR_CLASS } from '@ureeka-notebook/web-service';

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

  // == Lifecycle =================================================================
  public constructor(model: ImageModel, editor: Editor, node: ImageNodeType, imageStorage: ImageStorage, getPos: getPosType) {
    super(model, editor, node, imageStorage, getPos);

    // -- UI ----------------------------------------------------------------------
    const { imageElement } = this.createViewElements();
    this.imageElement = imageElement;
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
          imageElement.style.width = '100%'/*default*/;
          imageElement.style.height = '100%'/*default*/;

    return { imageElement };
  }

  // -- Update --------------------------------------------------------------------
  public updateView(): void {
    super.updateView();
    this.syncView();
  }

  // ensure the Image DOM element has the latest attributes
  private syncView() {
    const { src, borderStyle, borderWidth, borderColor, width, height } = this.node.attrs;

    // if invalid src, show defaults
    if(!src || src === DEFAULT_IMAGE_SRC || src === DEFAULT_IMAGE_ERROR_SRC) {
      this.imageElement.style.display = 'none'/*hide*/;

      this.dom.style.width = DEFAULT_IMAGE_WIDTH;
      this.dom.style.height = DEFAULT_IMAGE_HEIGHT;
      this.dom.style.backgroundColor = '#CCC'/*gray*/;

      if(isBlank(src) || src === DEFAULT_IMAGE_ERROR_SRC) {
        this.dom.classList.add(IMAGE_ERROR_CLASS);
      } /* else -- no error state, do not add error class */

      return/*no image to display*/;
    } /* else -- show the Image */

    this.imageElement.style.display = 'inline'/*show*/;
    this.dom.classList.remove(IMAGE_ERROR_CLASS);
    this.imageElement.setAttribute(AttributeType.Src, src);

    // apply show-Image styles to the DOM container
    width ? this.dom.style.width = width : this.dom.style.width = ''/*none*/;
    height ? this.dom.style.height = height : this.dom.style.height = ''/*none*/;
    borderColor ? this.dom.style.borderColor = borderColor : this.dom.style.borderColor = DEFAULT_IMAGE_BORDER_COLOR;
    borderStyle ? this.dom.style.borderStyle = borderStyle : this.dom.style.borderStyle = DEFAULT_IMAGE_BORDER_STYLE;
    borderWidth ? this.dom.style.borderWidth = borderWidth : this.dom.style.borderWidth = DEFAULT_IMAGE_BORDER_WIDTH;
  }
}
