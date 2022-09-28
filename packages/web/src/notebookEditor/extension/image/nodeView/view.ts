import { Editor } from '@tiptap/core';

import { getPosType, AttributeType, NodeName, ImageNodeType, DATA_NODE_TYPE } from '@ureeka-notebook/web-service';

import { AbstractNodeView } from 'notebookEditor/model/AbstractNodeView';

import { ImageModel } from './model';
import { ImageStorage } from './storage';

// ********************************************************************************
// NOTE: this NodeView does not use React since TaskListItems do not have a
//       complex structure, nor do they require a Storage or an Id
export class ImageView extends AbstractNodeView<ImageNodeType, ImageStorage, ImageModel> {
  private imageDOM: HTMLElement;

  // == Lifecycle =================================================================
  public constructor(model: ImageModel, editor: Editor, node: ImageNodeType, imageStorage: ImageStorage, getPos: getPosType) {
    super(model, editor, node, imageStorage, getPos);
    this.imageDOM = this.dom;

    if(this.node.attrs[AttributeType.Uploaded]) {
      this.updateView();
    } /* else -- not uploaded yet, no need to update the View */
  }

  // -- Creation ------------------------------------------------------------------
  protected createDomElement() {
    // create an Image with default attributes
    const image = document.createElement('img');
          image.setAttribute(DATA_NODE_TYPE, NodeName.IMAGE);
    return image;
  }

  public updateView(): void {
    super.updateView();

    const src = this.node.attrs[AttributeType.Src];
    const width = this.node.attrs[AttributeType.Width];
    const height = this.node.attrs[AttributeType.Height];

    if(!src) return/*nothing to do*/;
    this.imageDOM.setAttribute(AttributeType.Src, src);

    if(!width || !height) return/*no dimensions to update*/;
    this.imageDOM.setAttribute('style', `${[AttributeType.Width]}: ${width}; ${[AttributeType.Height]}: ${height};`);
  }
}
