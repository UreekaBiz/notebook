import { Editor } from '@tiptap/core';

import { getPosType, AttributeType, NodeName, ImageNodeType, DATA_NODE_TYPE, DEFAULT_IMAGE_ERROR_SRC, DEFAULT_IMAGE_HEIGHT, DEFAULT_IMAGE_SRC, DEFAULT_IMAGE_WIDTH } from '@ureeka-notebook/web-service';

import { createInlineNodeContainer } from 'notebookEditor/extension/inlineNodeWithContent/util';
import { AbstractNodeView } from 'notebookEditor/model/AbstractNodeView';

import { ImageModel } from './model';
import { ImageStorage } from './storage';

// ********************************************************************************
// NOTE: this NodeView does not use React since TaskListItems do not have a
//       complex structure, nor do they require a Storage or an Id
export class ImageView extends AbstractNodeView<ImageNodeType, ImageStorage, ImageModel> {
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

    if(this.node.attrs[AttributeType.Uploaded]) {
      this.updateView();
    } /* else -- not uploaded yet, no need to update the View */
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
          imageElement.style.display = 'none';

    const divElement = document.createElement('div');
          divElement.style.display = 'auto';
          divElement.style.backgroundColor = '#CCCCCC'/*gray*/;
          divElement.style[AttributeType.Width] = DEFAULT_IMAGE_WIDTH;
          divElement.style[AttributeType.Height] = DEFAULT_IMAGE_HEIGHT;

    return { imageElement, divElement };
  }

  // -- Update --------------------------------------------------------------------
  public updateView(): void {
    super.updateView();
    this.syncView();
  }

  // ensure the Image DOM element has the latest attributes
  private syncView() {
    const src = this.node.attrs[AttributeType.Src];
    const width = this.node.attrs[AttributeType.Width];
    const height = this.node.attrs[AttributeType.Height];

    // if invalid src, show the default div
    if(!src || src === DEFAULT_IMAGE_SRC || src === DEFAULT_IMAGE_ERROR_SRC) {
      this.imageElement.style.display = 'none';
      this.divElement.style.display = 'auto';
      return;
    } /* else -- show the Image's content */

    this.divElement.style.display = 'none';
    this.imageElement.style.display = 'auto';
    this.imageElement.setAttribute(AttributeType.Src, src);

    if(!width || !height) return/*no dimensions to update*/;
    this.imageElement.setAttribute('style', `${[AttributeType.Width]}: ${width}; ${[AttributeType.Height]}: ${height};`);
  }
}
