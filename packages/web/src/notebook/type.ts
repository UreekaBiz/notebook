import { Notebook, NotebookFilter } from '@ureeka-notebook/web-service';

// ********************************************************************************
// == Access ======================================================================
// NOTE: when adding new sort fields don't forget to also update isNotebookAccessField.
export type NotebookAccessField = keyof Pick<NotebookFilter, 'createdBy' | 'editableBy' | 'viewableBy'>;
// CHECK: Is there a better way to do this?
export const isNotebookAccessField = (value: any): value is NotebookAccessField => value === 'createdBy' || value === 'editableBy' || value === 'viewableBy';

export const ReadableNotebookAccessField: Record<NotebookAccessField, string> = {
  createdBy: 'Creator',
  editableBy: 'Editor',
  viewableBy: 'Viewer',
};

export const getReadableNotebookAccessField = (field: NotebookAccessField) => ReadableNotebookAccessField[field];

// == Sort ========================================================================
type LimitedNotebookSortField = keyof Pick<Notebook, 'name' | 'createdBy'>/*SEE: TODO below*/;
export const ReadableNotebookSortField: Record<LimitedNotebookSortField, string> = {
  name: 'Title',
  // NOTE: holding on adding this one: createTimestamp: 'Create Time',
  createdBy: 'Created By',
};

export const getReadableNotebookSortField = (field: LimitedNotebookSortField) => ReadableNotebookSortField[field];
