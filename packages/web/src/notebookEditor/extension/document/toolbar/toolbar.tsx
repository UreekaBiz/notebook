import { NodeName } from '@ureeka-notebook/web-service';

import { Toolbar, ToolItem } from 'notebookEditor/toolbar/type';
import { InsertNumbersToolItem } from './InsertNumbersToolItem';
import { InsertTextToolItem } from './InsertTextToolItem';

import { PreviewPublishedNotebookToolItem } from './PreviewPublishedNotebookToolItem';
import { PublishNotebookButton } from './PublishNotebookButton';
import { SetThemeToolItem } from './SetThemeToolItem';
import { ShareNotebookToolItem } from './ShareNotebookToolItem';

//*********************************************************************************
// == Tool items ==================================================================
export const previewPublishedNotebookToolItem: ToolItem = {
  toolType: 'component',
  name: 'previewPublishedNotebookToolItem',

  component: PreviewPublishedNotebookToolItem,
};

export const publishNotebookToolItem: ToolItem = {
  name: 'publishNotebook',
  toolType: 'component',

  component: PublishNotebookButton,
};

export const shareNotebookToolItem: ToolItem = {
  name: 'shareNotebookToolItem',
  toolType: 'component',

  component: ShareNotebookToolItem,
};

export const setThemeToolItem: ToolItem = {
  toolType: 'component',
  name: 'setThemeToolItem',

  component: SetThemeToolItem,
};

export const insertNumbersToolItem: ToolItem = {
  toolType: 'component',
  name: 'insertNumbersToolItem',

  component: InsertNumbersToolItem,
};

export const insertTextToolItem: ToolItem = {
  toolType: 'component',
  name: 'insertTextToolItem',

  component: InsertTextToolItem,
};

// == Toolbar =====================================================================
export const DocumentToolbar: Toolbar = {
  title: 'Document',
  name: NodeName.DOC,

  toolsCollections: [
    [
      publishNotebookToolItem,
      previewPublishedNotebookToolItem,
    ],
    [
      shareNotebookToolItem,
    ],
    [
      setThemeToolItem,
    ],
    [
      insertTextToolItem,
      insertNumbersToolItem,
    ],
  ],
};
