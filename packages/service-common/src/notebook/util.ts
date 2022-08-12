import { ShareRole } from '../util/share';
import { assertNever } from '../util/type';
import { UserIdentifier } from '../util/user';
import { Notebook } from './type';

// ********************************************************************************
// == Permission ==================================================================
export const isNotebookCreator = (userId: UserIdentifier, notebook: Notebook): boolean =>
  (notebook.createdBy === userId);
export const isNotebookEditor = (userId: UserIdentifier, notebook: Notebook): boolean =>
  notebook.editors.includes(userId) || isNotebookCreator(userId, notebook)/*pedantic*/;
export const isNotebookViewer = (userId: UserIdentifier, notebook: Notebook): boolean =>
  notebook.viewers.includes(userId) || notebook.editors.includes(userId)/*pedantic*/ || isNotebookCreator(userId, notebook)/*pedantic*/;

export const isNotebookRole = (userId: UserIdentifier, notebook: Notebook, role: ShareRole): boolean => {
  switch(role) {
    case ShareRole.Creator: return isNotebookCreator(userId, notebook);
    case ShareRole.Editor:  return isNotebookEditor(userId, notebook);
    case ShareRole.Viewer:  return isNotebookViewer(userId, notebook);
    default: return assertNever(role);
  }
};

// == Share =======================================================================
// returns the Map of shared UserIdentifiers to ShareRole for the specified Notebook
export const getNotebookShareRoles = (notebook: Notebook): Map<UserIdentifier, ShareRole> => {
  const userRoles = new Map<UserIdentifier, ShareRole>();

  // add the Users in ascending role order
  notebook.viewers.forEach(userId => userRoles.set(userId, ShareRole.Viewer));
  notebook.editors.forEach(userId => userRoles.set(userId, ShareRole.Editor));
  userRoles.set(notebook.createdBy, ShareRole.Creator);

  return userRoles;
};
