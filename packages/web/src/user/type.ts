import { NotebookRole } from '@ureeka-notebook/service-common';

// ********************************************************************************
export const ReadableNotebookRole: Record<NotebookRole, string> = {
  [NotebookRole.Creator]: 'Creator',
  [NotebookRole.Editor]: 'Editor',
  [NotebookRole.Viewer]: 'Viewer',
};
export const getReadableNotebookRole = (role: NotebookRole) => ReadableNotebookRole[role];
