import { Fragment, Node as ProseMirrorNode, Slice } from 'prosemirror-model';
import { Plugin } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';

import { createListItemContentNode, createListItemNode, createTaskListItemNode, isListItemContentNode, isTaskListNode, NotebookSchemaType } from '@ureeka-notebook/web-service';

import { NoPluginState } from 'notebookEditor/model/type';

import { maybeJoinList } from '../util';

// ********************************************************************************
// NOTE: this Plugin is located at the ListItem level for name consistency.
//       Its functionality involves mainly List Nodes themselves, but since
//       both ListItems and TaskListItems can be part of them, it is located at
//       this level (SEE: maybeJoinList).

// == Plugin ======================================================================
export const ListItemTaskListItemPlugin = () => {
  // used to distinguish between a regular paste and a plain text paste,
  // whose presence has influence only when pasting inside ListItems
  // (SEE: #handlePaste below)
  let isPlainTextPaste = false/*default*/;

  return new Plugin<NoPluginState, NotebookSchemaType>({
    // -- Transaction -------------------------------------------------------------
    // ensure that Lists are joined if possible (SEE: maybeJoinList)
    appendTransaction(transactions, oldState, newState) {
      const { tr } = newState;
      const updated = maybeJoinList(tr);
      if(updated) {
        return tr;
      } /* else -- do nothing extra to the Transaction */

      return/*nothing to do*/;
    },

    // -- Props -------------------------------------------------------------------
    props: {
      // ensure textBlocks that get pasted into Lists become ListItems, or that
      // their content gets pasted correctly if pasting as plain-text
      handlePaste: (view: EditorView, event: ClipboardEvent, slice: Slice) => {
        const { selection, schema } = view.state;
        const { $anchor } = selection;
        const { parent } = $anchor;
        if(!isListItemContentNode(parent)) return false/*let PM handle the event*/;

        const parentListItem = $anchor.node(-1/*depth is ListItemContent, -1 is ListItem, -2 is List*/);
        const grandParentList = $anchor.node(-2/*(SEE: comment above)*/);
        const { tr } = view.state;

        try {
          // if the contents of a single Block are being pasted, or a plain Text
          // paste is happening, paste the Slice's content as Text only
          const pastingSingleBlock = slice.content.childCount === 1 && slice.content.child(0/*first child*/).isTextblock;
          if(isPlainTextPaste || pastingSingleBlock) {
            tr.insertText(slice.content.textBetween(0/*slice start*/, slice.content.size, ' '/*add a space per pasted Block Node*/));
            view.dispatch(tr);
            return true/*event handled*/;
          } /* else -- not a plain text event, turn each Block into a ListItem */

          const newSliceContent: ProseMirrorNode[] = [];
          slice.content.descendants(node => {
            if(node.isTextblock) {
              const { textContent } = node;
              if(textContent.length < 1) return true/*do nothing, keep descending*/;

              if(isTaskListNode(grandParentList)) {
                const taskListItemNode = createTaskListItemNode(schema, { ...parentListItem.attrs }, createListItemContentNode(schema, { ...parentListItem.attrs }, schema.text(textContent)));
                newSliceContent.push(taskListItemNode);
              } else {
                const listItemNode = createListItemNode(schema, { ...parentListItem.attrs }, createListItemContentNode(schema, { ...parentListItem.attrs }, schema.text(textContent)));
                newSliceContent.push(listItemNode);
              }
              return false/*do not descend further into children*/;
            } /* else -- not a textBlock, keep descending */

            return true/*keep descending*/;
          });

          tr.replaceSelection(new Slice(Fragment.from(newSliceContent), 0/*use full Slice*/, 0/*use full Slice*/));
          view.dispatch(tr);
          return true/*event handled*/;
        } finally {
          isPlainTextPaste = false/*default*/;
        }
      },

      // check to see if a paste is a plain text paste so it gets handled
      // accordingly, only when pasting inside ListItems or TaskListItems
      // (SEE: #handlePaste above)
      handleKeyDown: (view: EditorView, event: KeyboardEvent) => {
        if(event.shiftKey && event.metaKey && event.code === 'KeyV') {
          isPlainTextPaste = true/*set the flag*/;
          return false/*allow event to pass, it will be manually handled above*/;
        } else {
          isPlainTextPaste = false/*by definition*/;
          return false/*let PM handle the event*/;
        }
      },
    },
  });
};
