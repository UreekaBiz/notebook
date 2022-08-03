import { Editor } from '@tiptap/core';
import { find } from 'linkifyjs';
import { Slice } from 'prosemirror-model';
import { Plugin, PluginKey } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { string } from 'yup';

import { NotebookSchemaType, MarkName } from '@ureeka-notebook/web-service';
import { NoPluginState } from 'notebookEditor/model/type';

// ********************************************************************************
// REF: https://github.com/ueberdosis/tiptap/blob/main/packages/extension-link/src/helpers/pasteHandler.ts

// == Plugin ======================================================================
const linkPasteKey = new PluginKey<NoPluginState, NotebookSchemaType>('linkPasteKey');
export const linkPastePlugin = (editor: Editor): Plugin => {
  return new Plugin({
    key: linkPasteKey,
    props: {
      // Ensure that when a link is pasted over a text that -doesn't- already
      // have a link mark, and the selection is -not- empty, the selected portion
      // of text receives the link mark with the pasted link as its href attribute
      handlePaste: (view: EditorView, event: ClipboardEvent, slice: Slice) => {
        const { state } = view,
             { selection } = state,
             { empty } = selection;
        if(empty) return false/*nothing else to do*/;

        // Merge the content of all nodes from the slice.
        let textContent = '';
        slice.content.forEach(node => textContent += node.textContent);

        // Finds a valid link using the linkifyjs library.
        const link = find(textContent).find(item => item.isLink && item.value === textContent.trim(/*to take into account transformPastedText effects*/));
        if(!textContent || !link) return false/*nothing else to do*/;
        const { href } = link;

        if(editor.isActive(MarkName.LINK)) return false/*replace text*/;

        return editor.commands.setMark(view.state.schema.marks.link, { href });
      },

      // Ensure that pasted links get a space added to them at the end, so that
      // typing after having pasted a link does not include the link mark
      transformPastedText(text: string) {
        const isUrl = urlSchema.validateSync(text);
        if(isUrl) text += ' ';
        /* else -- not an url, do not add space */
        return text;
      },
    },
  });
};

// -- URL -------------------------------------------------------------------------
// a string()-based URL schema that allows for 'localhost'. Specifically, it only
// adds 'localhost' to the existing Yup regex
// NOTE: the following bug is not fixed: https://github.com/jquense/yup/issues/224
// REF: https://github.com/jquense/yup/blob/master/src/string.js#L9
const URL_REGEXP = /^((https?|ftp):)?\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(localhost|((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i;
const urlSchema = string()
    .matches(URL_REGEXP, { excludeEmptyString: true/*matches .url() behavior*/ });
