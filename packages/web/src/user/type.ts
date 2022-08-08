import { NotebookRole } from '@ureeka-notebook/web-service';

// ********************************************************************************
export const ReadableNotebookRole: Record<NotebookRole, string> = {
  [NotebookRole.Creator]: 'Creator',
  [NotebookRole.Editor]: 'Editor',
  [NotebookRole.Viewer]: 'Viewer',
};
export const getReadableNotebookRole = (role: NotebookRole) => ReadableNotebookRole[role];
