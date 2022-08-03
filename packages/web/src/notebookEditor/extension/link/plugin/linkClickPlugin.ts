import { getAttributes } from '@tiptap/core';
import { EditorState, Plugin, PluginKey, Transaction } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';

import { NotebookSchemaType, MarkName } from '@ureeka-notebook/web-service';

import { NoPluginState } from 'notebookEditor/model/type';
import { isValidHTMLElement } from 'notebookEditor/extension/util/parse';
import { CLICKABLE_CLASS } from 'notebookEditor/theme/theme';

import { sanitizeLinkInput } from '../util';

// ********************************************************************************
// Plugin that handles the clicks on links. When a User clicks on a link while also
// pressing the CMD or CTRL key, the link will be opened the specified target. This
// also means that a special class is added to the link, so that the User have an
// indication that the link is clickable.
// REF: https://github.com/ProseMirror/prosemirror-tables/blob/master/src/columnresizing.js
// REF: https://github.com/ueberdosis/tiptap/blob/main/packages/extension-link/src/helpers/clickHandler.ts

// == Type ========================================================================
type LinkClickMeta = { isClickable: boolean; };

// == Class =======================================================================
class LinkClick {
  constructor(public isClickable: boolean ) { this.isClickable = isClickable; }

  apply(tr: Transaction, thisPluginState: LinkClick, oldEditorState: EditorState, newEditorState: EditorState) { /*produce a new plugin state*/
    const { isClickable } = getLinkClickMeta(tr);
    this.isClickable = isClickable;
    return this;
  }
}

// == Plugin ======================================================================
const linkClickKey = new PluginKey<NoPluginState, NotebookSchemaType>('linkClickKey');
export const linkClickPlugin = (): Plugin => {
  return new Plugin({
    // -- Setup -------------------------------------------------------------------
    key: linkClickKey,

    // -- State -------------------------------------------------------------------
    state: {
      init(_, state) { return new LinkClick(false/*default pointer not set*/); },
      apply(transaction, thisPluginState, oldState, newState) { return thisPluginState.apply(transaction, thisPluginState, oldState, newState); },
    },

    props: {
      // ensures that a click on a link opens said link -only- if the CtrlKey or the
      // CmdKey are pressed when clicking said link
      handleClick: (view: EditorView, pos: number, event: MouseEvent) => {
        const { target } = event;
        if(!isCtrlOrCmdPressed(event) || !isValidHTMLElement(target)) return false/*nothing to do*/;

        const attrs = getAttributes(view.state, MarkName.LINK);

        // gets the closes ancestor of the target that is a link
        const link = target.closest('a');
        if(!link || !attrs.href) return false/*nothing to do*/;

        // CHECK: Do we want the user to specify the target? This is only used for
        //        the editor itself, maybe the target should always be _blank?
        // open te link in the target specified by the link.
        window.open(sanitizeLinkInput(attrs.href), attrs.target);
        return true;
      },

      // ensures that the cursor is set to 'pointer' when the user has the cmd
      // or ctrl keys pressed and is hovering over text that has a link mark
      handleDOMEvents: {
        mousemove(view: EditorView, event: MouseEvent) {
          view.dispatch(view.state.tr.setMeta(linkClickKey, { isClickable: canBeClicked(event) }));
          return false/*change is only visual*/;
        },
      },

      // add pointer class to links when the Node is clickable
      attributes(state: EditorState) {
        const { isClickable } = getLinkClickState(state);
        return isClickable
          ? { class: CLICKABLE_CLASS }
          : null;
      },
    },
  });
};

// == Util ========================================================================
// -- State -----------------------------------------------------------------------
const getLinkClickState = (state: EditorState<any>) => linkClickKey.getState(state) as LinkClick/*by contract*/;
const getLinkClickMeta = (tr: Transaction): LinkClickMeta => {
  const meta = tr.getMeta(linkClickKey);
  if(!isLinkClickMeta(meta)) return { isClickable: false/*by definition*/ };
  return meta;
};

// -- Element ---------------------------------------------------------------------
const hasLinkAncestor = (target: HTMLElement) => {
  let element = target;

  // Traverse up the DOM tree until we find a link or we reach the root
  while(element.parentElement/*is not root Node*/) {
    if(element.tagName.toLowerCase() === 'a') return true/*already found -- stop searching*/;

    element = element.parentElement;
  }

  return false/*not found*/;
};

// -- Event -----------------------------------------------------------------------
const isCtrlOrCmdPressed = (event: MouseEvent | KeyboardEvent) => event.ctrlKey || event.metaKey;
const canBeClicked = (event: MouseEvent | KeyboardEvent) => isCtrlOrCmdPressed(event) && isValidHTMLElement(event.target) && hasLinkAncestor(event.target);

// -- Type Guard ------------------------------------------------------------------
const isLinkClickMeta = (object: any): object is LinkClickMeta => object && 'isClickable' in object;
