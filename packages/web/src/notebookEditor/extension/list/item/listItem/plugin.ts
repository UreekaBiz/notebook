import { Plugin } from 'prosemirror-state';

import { NoPluginState } from 'notebookEditor/model/type';

import { maybeJoinList } from '../../util';

// ********************************************************************************
// NOTE: this Plugin is located at the ListItem level for name consistency.
//       Its functionality involves mainly List Nodes themselves, but since
//       both ListItems and TaskListItems can be part of them, it is located at
//       this level (SEE: maybeJoinList).

// == Plugin ======================================================================
export const listItemTaskListItemPlugin = () => {
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
  });
};
