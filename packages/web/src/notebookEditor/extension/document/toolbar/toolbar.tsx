import { NodeName } from '@ureeka-notebook/web-service';

import { Toolbar, ToolItem } from 'notebookEditor/toolbar/type';

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
  ],
};
