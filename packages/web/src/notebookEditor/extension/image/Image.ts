import { Node } from '@tiptap/core';

import { getNodeOutputSpec, isImageNode, AttributeType, ImageNodeSpec, SetAttributeType, DEFAULT_IMAGE_BORDER_COLOR, DEFAULT_IMAGE_BORDER_STYLE, DEFAULT_IMAGE_BORDER_WIDTH, DEFAULT_IMAGE_HEIGHT, DEFAULT_IMAGE_PARSE_TAG, DEFAULT_IMAGE_SRC, DEFAULT_IMAGE_WIDTH } from '@ureeka-notebook/web-service';

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
      [AttributeType.BorderColor]: { default: DEFAULT_IMAGE_BORDER_COLOR, parseHTML: (element) => element.style.borderColor },
      [AttributeType.BorderStyle]: { default: DEFAULT_IMAGE_BORDER_STYLE, parseHTML: (element) => element.style.borderStyle },
      [AttributeType.BorderWidth]: { default: DEFAULT_IMAGE_BORDER_WIDTH, parseHTML: (element) => element.style.borderWidth },
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
  parseHTML() { return [{ tag: DEFAULT_IMAGE_PARSE_TAG }]; },
  renderHTML({ node, HTMLAttributes }) { return getNodeOutputSpec(node, HTMLAttributes, true/*is leaf node*/); },
});
