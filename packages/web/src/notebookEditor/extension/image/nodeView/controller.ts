import { Editor } from '@tiptap/core';

import { defaultImageAttributes, getDownloadURL, getPosType, lastValueFrom, updateSingleNodeAttributesCommand, AssetService, AttributeType, ImageAttributes, ImageNodeType, NodeName, DEFAULT_IMAGE_ERROR_SRC, DEFAULT_IMAGE_HEIGHT, DEFAULT_IMAGE_SRC, DEFAULT_IMAGE_WIDTH } from '@ureeka-notebook/web-service';

import { AbstractNodeController } from 'notebookEditor/model/AbstractNodeController';

import { getImageMeta, fitImageDimension } from '../util';
import { ImageModel } from './model';
import { ImageStorage } from './storage';
import { ImageView } from './view';

// ********************************************************************************
export class ImageController extends AbstractNodeController<ImageNodeType, ImageStorage, ImageModel, ImageView> {
  // == Lifecycle =================================================================
  public constructor(editor: Editor, node: ImageNodeType, storage: ImageStorage, getPos: getPosType, private initialSrc: string | undefined/*not set for the Image Node*/) {
    const model = new ImageModel(editor, node, storage, getPos),
          view = new ImageView(model, editor, node, storage, getPos);

    super(model, view, editor, node, storage, getPos);

    if(!this.node.attrs[AttributeType.Uploaded]) {
      this.uploadImage();
    } /* else -- this Image has already been uploaded to Storage, do nothing */
  }

  private async uploadImage() {
    const src = this.initialSrc;
    if(!src || src === DEFAULT_IMAGE_SRC) return/*src does not exist or is the default one, no need to upload*/;

    try {
      const img = await getImageMeta(src);
      const { fittedWidth: width, fittedHeight: height } = fitImageDimension(img);

      const blobResponse = await fetch(src);
      const blob = await blobResponse.blob();

      const firstSnapshot = await lastValueFrom(AssetService.getInstance().upload$(blob));
      const storageUrl = await getDownloadURL(firstSnapshot.ref);

      updateSingleNodeAttributesCommand<ImageAttributes>(NodeName.IMAGE, this.getPos(),
        { ...defaultImageAttributes, src: storageUrl, width, height, uploaded: true/*uploaded to Storage*/ },
        false/*User should not be able to undo this update*/)(this.editor.state, this.editor.view.dispatch);
    } catch(error) {
      // if unable to fit and upload, use defaults
      updateSingleNodeAttributesCommand<ImageAttributes>(NodeName.IMAGE, this.getPos(),
        { ...defaultImageAttributes, src: DEFAULT_IMAGE_ERROR_SRC, width: DEFAULT_IMAGE_WIDTH, height: DEFAULT_IMAGE_HEIGHT, uploaded: true/*do not retry upload*/ },
        false/*User should not be able to undo this update*/)(this.editor.state, this.editor.view.dispatch);
    } finally {
      this.nodeView.updateView();
    }
  }
}
