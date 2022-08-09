import { ShareRole } from '@ureeka-notebook/web-service';

// ********************************************************************************
// maps from the enum to a UI-friendly string
export const ReadableNotebookRole: Record<ShareRole, string> = {
  [ShareRole.Creator]: 'Creator',
  [ShareRole.Editor]: 'Editor',
  [ShareRole.Viewer]: 'Viewer',
};
export const getReadableNotebookRole = (role: ShareRole) => ReadableNotebookRole[role];
