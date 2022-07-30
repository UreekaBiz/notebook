import { Node } from '@tiptap/core';

import { AttributeType, ImageNodeSpec, SetAttributeType, NodeName } from '@ureeka-notebook/web-service';

import { getNodeOutputSpec, setAttributeParsingBehavior } from 'notebookEditor/extension/util/attribute';
import { NoOptions } from 'notebookEditor/model/type';
import { DialogStorage } from 'notebookEditor/model/DialogStorage';

import { insertAndSelectImageCommand } from './command';
import { imagePaste } from './plugin';

// ********************************************************************************
// REF: https://github.com/ueberdosis/tiptap/blob/main/packages/extension-image/src/image.ts

// == Node ========================================================================
export const Image = Node.create<NoOptions, DialogStorage>({
  ...ImageNodeSpec,

  // -- Attribute -----------------------------------------------------------------
  addAttributes() {
    return {
      [AttributeType.Src]: setAttributeParsingBehavior(AttributeType.Src, SetAttributeType.STRING),
      [AttributeType.Alt]: setAttributeParsingBehavior(AttributeType.Alt, SetAttributeType.STRING),
      [AttributeType.Title]: setAttributeParsingBehavior(AttributeType.Title, SetAttributeType.STRING),

      // FIXME: use setAttributeParsingBehavior for styles once its been created
      //        and implemented in main branch. The Attributes below won't be
      //        pasted correctly until this is done
      [AttributeType.Width]: setAttributeParsingBehavior(AttributeType.Width, SetAttributeType.STRING),
      [AttributeType.Height]: setAttributeParsingBehavior(AttributeType.Height, SetAttributeType.STRING),
      [AttributeType.TextAlign]: setAttributeParsingBehavior(AttributeType.TextAlign, SetAttributeType.STRING),
      [AttributeType.VerticalAlign]: setAttributeParsingBehavior(AttributeType.VerticalAlign, SetAttributeType.STRING),
    };
  },

  // -- Command -------------------------------------------------------------------
  addCommands() { return { insertImage: insertAndSelectImageCommand }; },

  // -- Plugin --------------------------------------------------------------------
  addProseMirrorPlugins() { return [imagePaste(this.editor)]; },

  // -- Storage -------------------------------------------------------------------
  addStorage() { return new DialogStorage(); },

  // -- View ----------------------------------------------------------------------
  // NOTE: pasting images is currently disabled (i.e. they can only be added by URL
  //       through the dialog). Parsing content looking for the nodeName instead of
  //       the DEFAULT_PARSE_IMAGE_TAG (SEE: image.ts) enables this 'filtering'
  //       without the need to transformPasted content or similar while still pasting
  //       Nodes of all other types. When pasting is enabled again, ensure
  //       DEFAULT_PARSE_IMAGE_TAG is used
  // TODO: add DEFAULT_PARSE_IMAGE_TAG when pasting for images is enabled again
  parseHTML() { return [{ tag: NodeName.IMAGE }]; },
  renderHTML({ node, HTMLAttributes }) { return getNodeOutputSpec(node, HTMLAttributes, true/*is leaf node*/); },
});
