import { NotebookFilter, NotebookSortField } from '@ureeka-notebook/web-service';

// ********************************************************************************
// == Access ======================================================================
// NOTE: when adding new sort fields don't forget to also update isNotebookAccessField.
export type NotebookAccessField = keyof Pick<NotebookFilter, 'createdBy' | 'editableBy' | 'viewableBy'>;
// CHECK: Is there a better way to do this?
export const isNotebookAccessField = (value: any): value is NotebookAccessField => value === 'createdBy' || value === 'editableBy' || value === 'viewableBy';

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
