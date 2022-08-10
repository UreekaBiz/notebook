import { ShareRole } from '../util/share';
import { UserIdentifier } from '../util/user';
import { Notebook } from './type';

// ********************************************************************************
// == Permission ==================================================================
export const isNotebookEditor = (userId: UserIdentifier, notebook: Notebook): boolean =>
  notebook.editors.includes(userId) || (notebook.createdBy === userId);

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
