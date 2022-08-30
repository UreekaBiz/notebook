import { Notebook, NotebookFilter } from '@ureeka-notebook/web-service';

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
type LimitedNotebookSortField = keyof Pick<Notebook, 'name' | 'createdBy'>/*SEE: TODO below*/;
export const ReadableNotebookSortField: Record<LimitedNotebookSortField, string> = {
  name: 'Title',
  // NOTE: holding on adding this one: createTimestamp: 'Create Time',
  createdBy: 'Created By',
};

export const getReadableNotebookSortField = (field: LimitedNotebookSortField) => ReadableNotebookSortField[field];
