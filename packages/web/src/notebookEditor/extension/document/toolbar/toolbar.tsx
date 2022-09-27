import { NodeName } from '@ureeka-notebook/web-service';

import { Toolbar, ToolItem } from 'notebookEditor/sidebar/toolbar/type';
import { AddToCollectionToolItem } from './AddToCollectionToolItem';

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

// NOTE: this tool item will only be shown to the creator of the Notebook
// SEE: AddToCollectionToolItem.tsx
export const addToCollectionToolItem: ToolItem = {
  name: 'addToCollectionToolItem',
  toolType: 'component',

  component: AddToCollectionToolItem,
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
      shareNotebookToolItem,
      addToCollectionToolItem,
    ],
    [
      setThemeToolItem,
    ],
    [
      publishNotebookToolItem,
      previewPublishedNotebookToolItem,
    ],
  ],
};
