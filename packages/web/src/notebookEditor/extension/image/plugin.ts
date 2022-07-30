import { Editor } from '@tiptap/core';
import { Slice } from 'prosemirror-model';
import { Plugin } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';

import { isImageNode, DefaultImageAttributes, NotebookSchemaType } from '@ureeka-notebook/web-service';

import { NoPluginState } from 'notebookEditor/model/type';

import { fitImageDimension, getImageMeta } from './util';

// ********************************************************************************
// TODO: ensure no 'weird cursor going to the corner of the screen' behavior is
//       shown whenever pasting of images is added back

// == Paste =======================================================================
// NOTE: this plugin's functionality is currently not being used since the pasting
//       of Image Nodes is currently disabled (SEE: Image.ts)
// TODO: add back when pasting is enabled
export const imagePaste = (editor: Editor) => {
  let plugin = new Plugin<NoPluginState, NotebookSchemaType>({
    // -- Props -------------------------------------------------------------------
    props: {
      // ensures pasted images get pasted with their naturalWidth and naturalHeight
      // properties by default, by returning true from the paste call and inserting
      // the Image Nodes once the right image has been calculated
      handlePaste(view: EditorView, event: ClipboardEvent, slice: Slice) {/*when this returns true, paste is manually handled*/
        if(slice.size !== 1/*slices can be of size 0*/) return false/*do not manually handle*/;

        const pastedNode = slice.content.child(0/*guaranteed to exist by above check*/);
        if(!isImageNode(pastedNode)) return false/*do not manually handle*/;
        const { src } = pastedNode.attrs;
        if(!src) return false/*do not manually handle*/;
        /* else -- handle pasting an image */

        scheduleImageInsertion(editor, src);
        return true/*paste will be manually handled later*/;
      },
    },
  });

  return plugin;
};

// --------------------------------------------------------------------------------
// computes the correct width and height properties of the pasted image and appends
// the image as a Node
const scheduleImageInsertion = async (editor: Editor, imageSrc: string) => {
  const img = await getImageMeta(imageSrc),
        { src, fittedWidth: width, fittedHeight: height } = fitImageDimension(img);

  try {
    editor.chain().focus().insertImage({ ...DefaultImageAttributes, src, width, height }).run();
  } catch(error) {/*CHECK: can the above call fail?*/
    console.warn(`Error while pasting image: ${error}`);
  }
};
