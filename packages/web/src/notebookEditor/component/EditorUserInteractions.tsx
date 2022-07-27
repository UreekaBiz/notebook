import { useEffect } from 'react';

import { useValidatedEditor } from 'notebookEditor/hook/useValidatedEditor';
import { isNodeSelection } from 'notebookEditor/extension/util/node';
import { isValidHTMLElement } from 'notebookEditor/extension/util/parse';
import { TOOL_ITEM_DATA_TYPE } from 'notebookEditor/toolbar/type';

// ********************************************************************************
// handles Editor-related logic that requires the use of hooks (and hence it must
// be a component)
export const EditorUserInteractions = () => {
  // == State =====================================================================
  const editor  = useValidatedEditor();

  // == Effects ===================================================================
  /**
   * This effect handles shortcut listening for cases that are not specific to
   * the editor itself (e.g. showing dialogs)
   */
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      switch(event.code) {
        // Focus Sidebar on Cmd + Option + .
        case 'Period': {
          if(!(event.altKey && event.metaKey)) return/*nothing to do*/;

          const firstToolItem = [...document.querySelectorAll(`[datatype=${TOOL_ITEM_DATA_TYPE}]`)][0/*first one*/]/*necessary for type-guard below*/;
          if(!isValidHTMLElement(firstToolItem)) {
            console.warn('toolItem is not a valid HTML Element');
            return/*do nothing*/;
          }/* else -- valid html element */

          event.preventDefault();
          firstToolItem.focus();
          break;
        }

        // Focus editor on Cmd + Option + ,
        case 'Comma': {
          if(!(event.altKey && event.metaKey)) return;
          isNodeSelection(editor.state.selection)
            ? editor.chain().focus().setNodeSelection(editor.state.selection.$anchor.pos)
            : editor.commands.focus();
          event.preventDefault();
          break;
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [editor]);

  // == UI ========================================================================
  if(!editor) return null/*nothing to do*/;

  return null/*currently nothing*/;
};
