import { AiOutlineLink } from 'react-icons/ai';

import { getLinkMarkType, isNodeSelection, MarkName } from '@ureeka-notebook/web-service';

import { toolItemCommandWrapper } from 'notebookEditor/command/util';
import { toggleMarkInMarkHolderCommand } from 'notebookEditor/extension/markHolder/command';
import { getMarkHolder, inMarkHolder } from 'notebookEditor/extension/markHolder/util';
import { getDialogStorage } from 'notebookEditor/model/DialogStorage';
import { shouldShowToolItem } from 'notebookEditor/shared/toolItem';
import { Toolbar, ToolItem } from 'notebookEditor/sidebar/toolbar/type';

import { LinkColorToolItem } from './component/LinkColorToolItem';
import { LinkTargetToolItem } from './component/LinkTargetToolItem';
import { LinkURLToolItem } from './component/LinkURLToolItem';
import { unsetLinkCommand } from '../command';

// ********************************************************************************
// == Tool Items ==================================================================
export const linkToolItem: ToolItem = {
  toolType: 'button',

  name: MarkName.LINK/*expected and guaranteed to be unique*/,
  label: MarkName.LINK,

  icon: <AiOutlineLink size={16} />,
  tooltip: 'Link (⌘ + K)',

  shouldBeDisabled: (editor) => isNodeSelection(editor.state.selection),
  shouldShow: (editor, depth) => shouldShowToolItem(editor, depth),
  isActive: (editor) => {
    if(inMarkHolder(editor, MarkName.LINK)) return true/*is active in MarkHolder*/;

    return editor.isActive(MarkName.LINK);
  },
  onClick: (editor, depth) => {
    // if MarkHolder is defined toggle the Mark inside it
    const markHolder = getMarkHolder(editor.state);

    if(markHolder) {
      return toolItemCommandWrapper(editor, depth, toggleMarkInMarkHolderCommand(markHolder, getLinkMarkType(editor.schema)));
    } /* else -- MarkHolder not present */

    // (SEE: EditorUserInteractions.tsx)
    const { from } = editor.state.selection,
      linkMarkActive = editor.isActive(MarkName.LINK) || editor.state.doc.rangeHasMark(from, from + 1, editor.state.schema.marks[MarkName.LINK]);
    if(linkMarkActive) {
      return unsetLinkCommand()(editor.state/*current state*/, editor.view.dispatch);
    } /* else -- Link Mark not active, add a new one */

    const linkStorage = getDialogStorage(editor, MarkName.LINK);
    if(!linkStorage) return/*nothing to do*/;
    linkStorage.setShouldInsertNodeOrMark(true);

    // focus the Editor again
    return editor.view.focus();
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
      linkColorToolItem,
    ],
  ],
};
