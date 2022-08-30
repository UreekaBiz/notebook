import { NotebookFilter, NotebookSortField } from '@ureeka-notebook/web-service';

// ********************************************************************************
// == Access ======================================================================
export type NotebookAccessField = keyof Pick<NotebookFilter, 'createdBy' | 'editableBy' | 'viewableBy'>;
export const ReadableNotebookAccessField: Record<NotebookAccessField, string> = {
  createdBy: 'Created By',
  editableBy: 'Editable',
  viewableBy: 'Viewable',
};

export const getReadableNotebookAccessField = (field: NotebookAccessField) => ReadableNotebookAccessField[field];

// == Sort ========================================================================
export const ReadableNotebookSortField: Record<NotebookSortField, string> = {
  name: 'Name',
  createTimestamp: 'Create',
  createdBy: 'Author',
};

export const getReadableNotebookSortField = (field: NotebookSortField) => ReadableNotebookSortField[field];
