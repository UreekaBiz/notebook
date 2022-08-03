import { AiOutlineLink } from 'react-icons/ai';

import { MarkName } from '@ureeka-notebook/web-service';

import { getDialogStorage } from 'notebookEditor/model/DialogStorage';
import { Toolbar, ToolItem } from 'notebookEditor/toolbar/type';

import { LinkColorToolItem } from './component/LinkColorToolItem';
import { LinkTargetToolItem } from './component/LinkTargetToolItem';
import { LinkURLToolItem  } from './component/LinkURLToolItem';

// ********************************************************************************
// == Tool Items ==================================================================
export const linkToolItem: ToolItem = {
  toolType: 'button',

  name: MarkName.LINK/*expected and guaranteed to be unique*/,
  label: MarkName.LINK,

  icon: <AiOutlineLink size={16} />,
  tooltip: 'Link (⌘ + K)',

  onClick: (editor) => {
    // (SEE: EditorUserInteractions.tsx)
    const { $from } = editor.state.selection,
      linkMarkActive = editor.isActive(MarkName.LINK) || editor.state.doc.rangeHasMark($from.pos, $from.pos + 1, editor.state.schema.marks[MarkName.LINK]);
    if(linkMarkActive) {
      editor.chain().focus().unsetLink().run();
      return;
    } /* else -- Link Mark not active, add a new one */

    const linkStorage = getDialogStorage(editor, MarkName.LINK);
    if(!linkStorage) return/*nothing to do*/;
    linkStorage.setShouldInsertNodeOrMark(true);

    // Focus the editor again
    editor.commands.focus();
  },
};

export const linkURLToolItem: ToolItem = {
  toolType: 'component',
  name: 'linkURLToolItem'/*expected and guaranteed to be unique*/,

  component: LinkURLToolItem,
};

export const linkTargetToolItem: ToolItem = {
  toolType: 'component',
  name: 'linkTargetToolItem'/*expected and guaranteed to be unique*/,

  component: LinkTargetToolItem,
};

export const linkColorToolItem: ToolItem = {
  toolType: 'component',
  name: 'linkColorToolItem'/*expected and guaranteed to be unique*/,

  component: LinkColorToolItem,
};

// == Toolbar =====================================================================
export const LinkToolbar: Toolbar = {
  title: 'Link',
  name: MarkName.LINK/*Expected and guaranteed to be unique*/,

  toolsCollections: [
    [
      linkURLToolItem,
      linkTargetToolItem,
    ],
    [
      linkColorToolItem,
    ],
  ],
};
