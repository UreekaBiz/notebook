import { getAttributes } from '@tiptap/core';
import { Plugin, PluginKey } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';

import { AttributeType, MarkName } from '@ureeka-notebook/web-service';

import { NoPluginState } from 'notebookEditor/model/type';
import { isValidHTMLElement } from 'notebookEditor/extension/util/parse';

import { sanitizeLinkInput } from '../util';

// ********************************************************************************
// Plugin that handles the clicks on links. When a User clicks on a link while also
// pressing the CMD or CTRL key, the link will be opened the specified target. The
// pointer style is set through a class by React (SEE: Editor.tsx, index.css)
// REF: https://github.com/ProseMirror/prosemirror-tables/blob/master/src/columnresizing.js
// REF: https://github.com/ueberdosis/tiptap/blob/main/packages/extension-link/src/helpers/clickHandler.ts

// == Plugin ======================================================================
const linkClickKey = new PluginKey<NoPluginState>('linkClickKey');
export const linkClick = (): Plugin => {
  return new Plugin({
    // -- Setup -------------------------------------------------------------------
    key: linkClickKey,

    // -- Props -------------------------------------------------------------------
    props: {
      // ensures that a click on a link opens said link -only- if the CtrlKey or the
      // CmdKey are pressed when clicking said link
      handleClick: (view: EditorView, pos: number, event: MouseEvent) => {
        const { target } = event;
        if(!isCtrlOrCmdPressed(event) || !isValidHTMLElement(target)) return false/*nothing to do*/;

        const attrs = getAttributes(view.state, MarkName.LINK);

        // gets the closes ancestor of the target that is a link
        const link = target.closest('a');
        if(!link || !attrs[AttributeType.Href]) return false/*nothing to do*/;

        // CHECK: Do we want the user to specify the target? This is only used for
        //        the editor itself, maybe the target should always be _blank?
        // open te link in the target specified by the link.
        window.open(sanitizeLinkInput(attrs[AttributeType.Href]), attrs[AttributeType.Target]);
        return true;
      },

    },
  });
};

// == Util ========================================================================
const isCtrlOrCmdPressed = (event: MouseEvent | KeyboardEvent) => event.ctrlKey || event.metaKey;
