import { Node } from '@tiptap/core';

import { getNodeOutputSpec, isImageNode, AttributeType, ImageNodeSpec, SetAttributeType, DEFAULT_IMAGE_HEIGHT, DEFAULT_IMAGE_PARSE_TAG, DEFAULT_IMAGE_WIDTH } from '@ureeka-notebook/web-service';

import { setAttributeParsingBehavior, uniqueIdParsingBehavior } from 'notebookEditor/extension/util/attribute';
import { NoOptions } from 'notebookEditor/model/type';

import { ImageController } from './nodeView/controller';
import { ImageStorage } from './nodeView/storage';

// ********************************************************************************
// REF: https://github.com/ueberdosis/tiptap/blob/main/packages/extension-image/src/image.ts

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

      // NOTE: using custom parseHTML for these since the parsing behavior
      //       for styles has not been defined yet
      [AttributeType.Width]: { default: DEFAULT_IMAGE_WIDTH, parseHTML: (element) => element.style.width },
      [AttributeType.Height]: { default: DEFAULT_IMAGE_HEIGHT, parseHTML: (element) => element.style.height },
      [AttributeType.TextAlign]: { default: undefined/*none*/, parseHTML: (element) => element.style.textAlign },
      [AttributeType.VerticalAlign]: { default: undefined/*none*/, parseHTML: (element) => element.style.verticalAlign },
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

      // Create a new controller and NodeView instead.
      return new ImageController(editor, node, this.storage, getPos);
    };
  },
  parseHTML() { return [{ tag: DEFAULT_IMAGE_PARSE_TAG }]; },
  renderHTML({ node, HTMLAttributes }) { return getNodeOutputSpec(node, HTMLAttributes, true/*is leaf node*/); },
});
