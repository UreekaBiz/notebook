import { Node } from '@tiptap/core';

import { getNodeOutputSpec, isImageNode, AttributeType, ImageNodeSpec, NodeName, SetAttributeType, DATA_NODE_TYPE, DEFAULT_IMAGE_BORDER_COLOR, DEFAULT_IMAGE_BORDER_STYLE, DEFAULT_IMAGE_BORDER_WIDTH, DEFAULT_IMAGE_HEIGHT, DEFAULT_IMAGE_PARSE_TAG, DEFAULT_IMAGE_SRC, DEFAULT_IMAGE_WIDTH } from '@ureeka-notebook/web-service';

import { setAttributeParsingBehavior, uniqueIdParsingBehavior } from 'notebookEditor/extension/util/attribute';
import { NoOptions } from 'notebookEditor/model/type';

import { ImageController } from './nodeView/controller';
import { ImageStorage } from './nodeView/storage';

// ********************************************************************************
// NOTE: this is inspired by https://github.com/ueberdosis/tiptap/blob/main/packages/extension-image/src/image.ts

// == Node ========================================================================
export const Image = Node.create<NoOptions, ImageStorage>({
  ...ImageNodeSpec,

  // -- Attribute -----------------------------------------------------------------
  addAttributes() {
    return {
      // creates a new Id for the Node when it is created
      [AttributeType.Id]:  uniqueIdParsingBehavior(this.storage),

      // whether or not this Image has been uploaded to Storage
      [AttributeType.Uploaded]: setAttributeParsingBehavior(AttributeType.Uploaded, SetAttributeType.BOOLEAN, false/*default not uploaded*/),

      [AttributeType.Src]: setAttributeParsingBehavior(AttributeType.Src, SetAttributeType.STRING),
      [AttributeType.Alt]: setAttributeParsingBehavior(AttributeType.Alt, SetAttributeType.STRING),
      [AttributeType.Title]: setAttributeParsingBehavior(AttributeType.Title, SetAttributeType.STRING),

      [AttributeType.BorderColor]: setAttributeParsingBehavior(AttributeType.BorderColor, SetAttributeType.STYLE, DEFAULT_IMAGE_BORDER_COLOR),
      [AttributeType.BorderStyle]: setAttributeParsingBehavior(AttributeType.BorderStyle, SetAttributeType.STYLE, DEFAULT_IMAGE_BORDER_STYLE),
      [AttributeType.BorderWidth]: setAttributeParsingBehavior(AttributeType.BorderWidth, SetAttributeType.STYLE, DEFAULT_IMAGE_BORDER_WIDTH),
      [AttributeType.Width]: setAttributeParsingBehavior(AttributeType.Width, SetAttributeType.STYLE, DEFAULT_IMAGE_WIDTH),
      [AttributeType.Height]: setAttributeParsingBehavior(AttributeType.Height, SetAttributeType.STYLE, DEFAULT_IMAGE_HEIGHT),
      [AttributeType.TextAlign]: setAttributeParsingBehavior(AttributeType.TextAlign, SetAttributeType.STYLE),
      [AttributeType.VerticalAlign]: setAttributeParsingBehavior(AttributeType.VerticalAlign, SetAttributeType.STYLE),
    };
  },

  // -- Storage -------------------------------------------------------------------
  addStorage() { return new ImageStorage(); },

  // -- View ----------------------------------------------------------------------
    // -- View ----------------------------------------------------------------------
  // NOTE: NodeViews are supposed to be unique for each Node (based on the id of
  //       the node). This is done to persist the state of the node.
  addNodeView() {
    return ({ editor, node, getPos }) => {
      if(!isImageNode(node)) throw new Error(`Unexpected node type (${node.type.name}) while adding CodeBlockNode NodeView.`);
      const id = node.attrs[AttributeType.Id];
      if(!id) return {}/*invalid id -- no node view returned*/;

      const controller = this.storage.getNodeView(id);

      // Use existing NodeView, update it and return it.
      if(controller) {
        controller.updateProps(getPos);
        return controller;
      } /* else -- controller don't exists */

      // NOTE: since the default string for a pasted Image can be invalid (e.g.
      //       be a very large base64 image), it should never be added into the
      //       document. Hence, a Node with a default SRC is inserted into the
      //       document initially and the right source is loaded correctly
      //       afterwards (SEE: ImageController.tsx)
      const initialSrc = node.attrs[AttributeType.Src];
      if(!node.attrs[AttributeType.Uploaded]) {
        node.attrs[AttributeType.Src] = DEFAULT_IMAGE_SRC;
      } /* else -- Image has already been uploaded, allow src */

      // Create a new Controller and NodeView
      return new ImageController(editor, node, this.storage, getPos, initialSrc);
    };
  },

  // turn elements that are pasted Images, as well
  // as ImageNodeViews, into Image Nodes
  parseHTML() { return [{ tag: `${DEFAULT_IMAGE_PARSE_TAG}, span[${DATA_NODE_TYPE}="${NodeName.IMAGE}"]` }]; },
  renderHTML({ node, HTMLAttributes }) { return getNodeOutputSpec(node, HTMLAttributes, true/*is leaf node*/); },
});
