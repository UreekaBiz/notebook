import { NodeName } from '@ureeka-notebook/web-service';

import { EditorTool, EditorToolbar } from 'notebookEditor/toolbar/type';

import { PreviewPublishedNotebookToolItem } from './PreviewPublishedNotebookToolItem';
import { PublishNotebookButton } from './PublishNotebookButton';
import { ShareNotebookToolItem } from './ShareNotebookToolItem';

//*********************************************************************************
// == Tool items ==================================================================
export const previewPublishedNotebookToolItem: EditorTool = {
  toolType: 'component',
  name: 'previewPublishedNotebookToolItem',

  component: PreviewPublishedNotebookToolItem,
};

export const publishNotebookToolItem: EditorTool = {
  name: 'publishNotebook',
  toolType: 'component',

  component: PublishNotebookButton,
};

export const shareNotebookToolItem: EditorTool = {
  name: 'shareNotebookToolItem',
  toolType: 'component',

  component: ShareNotebookToolItem,
};

// == Toolbar =====================================================================
export const DocumentToolbar: EditorToolbar = {
  nodeName: NodeName.DOC,

  toolsCollections: [
    [
      publishNotebookToolItem,
      previewPublishedNotebookToolItem,
    ],
    [
      shareNotebookToolItem,
    ],
  ],
};
