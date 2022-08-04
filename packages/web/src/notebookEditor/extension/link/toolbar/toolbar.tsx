import { AiOutlineLink } from 'react-icons/ai';

import { getLinkMarkType, MarkName } from '@ureeka-notebook/web-service';

import { getMarkHolder, inMarkHolder, toggleMarkInMarkHolder } from 'notebookEditor/extension/markHolder/util';
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
    // if MarkHolder is defined toggle the Mark inside it
    const markHolder = getMarkHolder(editor);

    if(markHolder) return toggleMarkInMarkHolder(editor.state.selection, editor.chain, markHolder, getLinkMarkType(editor.schema))/*nothing else to do*/;

    // (SEE: EditorUserInteractions.tsx)
    const { $from } = editor.state.selection,
      linkMarkActive = editor.isActive(MarkName.LINK) || editor.state.doc.rangeHasMark($from.pos, $from.pos + 1, editor.state.schema.marks[MarkName.LINK]);
    if(linkMarkActive) {
      return editor.chain().focus().unsetLink().run();
    } /* else -- Link Mark not active, add a new one */

    const linkStorage = getDialogStorage(editor, MarkName.LINK);
    if(!linkStorage) return/*nothing to do*/;
    linkStorage.setShouldInsertNodeOrMark(true);

    // focus the Editor again
    return editor.commands.focus();
  },
  isActive: (editor) => {
    if(inMarkHolder(editor, MarkName.LINK)) return true/*is active in MarkHolder*/;

    return editor.isActive(MarkName.LINK);
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
