import { Editor, Extension } from '@tiptap/core';
import { Node as ProseMirrorNode } from 'prosemirror-model';

import { isInlineNodeWithContent, setNodeSelectionCommand } from '@ureeka-notebook/web-service';

import { shortcutCommandWrapper } from 'notebookEditor/command/util';
import { ExtensionName, ExtensionPriority, NoOptions, NoStorage } from 'notebookEditor/model/type';
import { changeBlockIndentationCommand } from 'notebookEditor/shared/command';

// ********************************************************************************
// == Extension ===================================================================
export const Keymap = Extension.create<NoOptions, NoStorage>({
  name: ExtensionName.KEYMAP/*Expected and guaranteed to be unique*/,
  priority: ExtensionPriority.KEYMAP,

  // -- Keyboard Shortcut ---------------------------------------------------------
  addKeyboardShortcuts() {
    return {
      // REF: https://prosemirror.net/docs/ref/#commands.pcBaseKeymap
      // NOTE: the default behavior for Mod-Enter (SEE: REF above) is to call
      //       exitCode() (which inserts a Paragraph below when the Selection is in a
      //       Node with the code prop in its Spec set to true. Since this behavior has
      //       been customized to Shift-Enter, reserving Cmd-Enter for execution of
      //       other Nodes at a Document level, return true
      //       (preventing the default behavior)
      'Mod-Enter': () => true/*do not let PM handle the shortcut*/,

      // dedent at Block level
      'Mod-[': () => shortcutCommandWrapper(this.editor, changeBlockIndentationCommand('dedent')),

      // indent at Block level
      'Mod-]': () => shortcutCommandWrapper(this.editor, changeBlockIndentationCommand('indent')),

      // prevent incorrect Selection when there is an InlineNodeWithContent whose
      // size would cause the Cursor to jump to either the top or the bottom
      // of the Document
      'ArrowUp': () => selectInlineNodeWithContent(this.editor, 'up'),
      'ArrowDown': () => selectInlineNodeWithContent(this.editor, 'down'),
    };
  },
});

// == Util ========================================================================
// prevent the Cursor from jumping to the very top or end of the Document whenever
// the size of an InlineNodeWithContent would make it do so, and instead, select it
const selectInlineNodeWithContent = (editor: Editor,  arrowDir: 'up' | 'down') => {
  const { empty, $from, from } = editor.state.selection;
  if(!empty) return false/*let PM handle the event*/;

  let nodeNearby: ProseMirrorNode | null/*not set*/;
  let nodeNearbyPos: number;
  try {
    if(arrowDir === 'up') { nodeNearby = $from.nodeBefore; }
    else { nodeNearby = $from.nodeAfter; }

    if(arrowDir === 'up') { nodeNearbyPos = Math.max(from-1/*nodeBefore*/, 0/*do not go behind Doc*/); }
    else { nodeNearbyPos = Math.min(from/*position can be a TextSelection and a NodeSelection at the same time*/, editor.state.doc.nodeSize/*do not go past Doc*/); }

    if(nodeNearby && isInlineNodeWithContent(nodeNearby)) {
      return shortcutCommandWrapper(editor, setNodeSelectionCommand(nodeNearbyPos));
    } else {
      return false/*let PM handle the event*/;
    }
  } catch(error) {
    return false/*invalid resulting Selection*/;
  }
};
