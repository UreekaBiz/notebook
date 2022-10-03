import { Fragment, Node as ProseMirrorNode, Slice } from 'prosemirror-model';
import { Plugin } from 'prosemirror-state';
import { AddMarkStep } from 'prosemirror-transform';
import { EditorView } from 'prosemirror-view';

import { createListItemContentNode, createListItemNode, createStrikethroughMark, createTaskListItemNode, isListItemContentNode, isTaskListItemNode, isTaskListNode, AttributeType } from '@ureeka-notebook/web-service';

import { NoPluginState } from 'notebookEditor/model/type';

import { isListNode, isListWithSingleItemContent, maybeJoinList } from '../util';

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

  return new Plugin<NoPluginState>({
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
        // NOTE: pasting can occur throughout multiple ClipboardEvents, some
        //       of which might produce the empty Slice. If a 'true' is returned
        //       in between these multiple ClipboardEvents, the next ones won't be
        //       processed. Hence the check below
        if(slice.content.size < 1) return false/*(SEE: NOTE above)*/;

        const { selection, schema } = view.state;
        const { $anchor } = selection;
        const { parent } = $anchor;

        if(!isListItemContentNode(parent)) return false/*let PM handle the event*/;

        const parentListItem = $anchor.node(-1/*depth is ListItemContent, -1 is ListItem, -2 is List*/);
        const grandParentList = $anchor.node(-2/*(SEE: comment above)*/);
        const { tr } = view.state;

        try {
          // -- check for plain text paste ---------------------------------------
          if(isPlainTextPaste) {
            tr.insertText(slice.content.textBetween(0/*slice start*/, slice.content.size, ' '/*add a space per pasted Block Node*/));
            view.dispatch(tr);
            return true/*event handled*/;
          } /* else -- not a plain text event, check if pasting as single block  */

          // -- check for single Atom paste ---------------------------------------
          const firstSliceChild = slice.content.firstChild;
          const pastingSingleChild = slice.content.childCount === 1;
          if(firstSliceChild && firstSliceChild.isAtom && pastingSingleChild) {
            tr.insert(tr.selection.from, firstSliceChild);
            view.dispatch(tr);
            return true/*event handled*/;
          } /* else -- not pasting a single Atom check if pasting as single block  */

          // -- check for singleBlock paste ---------------------------------------
          const pasteAsSingleBlock = pastingSingleChild && (firstSliceChild && firstSliceChild.isTextblock || (firstSliceChild && isListNode(firstSliceChild) && isListWithSingleItemContent(firstSliceChild)));
          if(pasteAsSingleBlock) {
            // since paste can occur several levels deep across Lists,
            // yet the above check guarantees that there is a
            // single ListItemContent being pasted, only paste
            // the last parent of said ListItemContent (which will
            // be a ListItem or a TaskListItem by contract) by descending
            let pastedListItemContent = firstSliceChild/*default*/;
            firstSliceChild.content.descendants(descendant => {
              if(isListItemContentNode(descendant)) {
                pastedListItemContent = descendant;
              } /* else -- do not change default */
            });

            // insert the content of the pasted ListItemContent
            tr.replaceSelection(new Slice(pastedListItemContent.content, 0/*use full Slice*/, 0/*use full Slice*/));

            // if pasting into a checked TaskListItem, ensure
            // the pasted content receives the Strikethrough Mark
            if(isTaskListItemNode(parentListItem) && parentListItem.attrs[AttributeType.Checked]) {
              const from = tr.selection.to - parentListItem.content.size;
              tr.step(new AddMarkStep(from, tr.selection.to, createStrikethroughMark(view.state.schema)));
            } /* else -- the content is not being pasted into a TaskListItem or it is not checked, no need to add Strikethrough Mark */

            view.dispatch(tr);
            return true/*event handled*/;
          } /* else -- turn each Block into a ListItem */

          // -- Blocks into ListItems paste ---------------------------------------
          const newSliceContent: ProseMirrorNode[] = [];
          slice.content.descendants(node => {
            if(node.isTextblock) {
              if(isTaskListNode(grandParentList)) {
                const taskListItemNode = createTaskListItemNode(schema, { ...parentListItem.attrs }, createListItemContentNode(schema, { ...parentListItem.attrs }, node.content));
                newSliceContent.push(taskListItemNode);
              } else {
                const listItemNode = createListItemNode(schema, { ...parentListItem.attrs }, createListItemContentNode(schema, { ...parentListItem.attrs }, node.content));
                newSliceContent.push(listItemNode);
              }
              return false/*do not descend further into children*/;
            } /* else -- not a textBlock, keep descending */

            return true/*keep descending*/;
          });

          tr.replaceSelection(new Slice(Fragment.from(newSliceContent), 0/*use full Slice*/, 0/*use full Slice*/));
          view.dispatch(tr);
          return true/*event handled*/;
        } catch(error) {
          console.warn(`Something went wrong while handling paste for Lists: ${error}`);
          return true/*prevent more side effects by marking event as handled*/;
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
