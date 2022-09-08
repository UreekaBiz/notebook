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
export const ListItemTaskListItemPlugin = () =>
new Plugin<NoPluginState, NotebookSchemaType>({
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
      handlePaste: (view: EditorView, event: ClipboardEvent, slice: Slice) => {
        const { selection, schema } = view.state;
        const { $anchor } = selection;
        const { parent } = $anchor;
        if(!isListItemContentNode(parent)) return false/*let PM handle the event*/;

        const parentListItem = $anchor.node(-1/*depth is ListItemContent, -1 is ListItem, -2 is List*/);
        const grandParentList = $anchor.node(-2/*(SEE: comment above)*/);
        const { tr } = view.state;

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
      },
    },
  });
