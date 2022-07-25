import { UserIdentifier } from '../util/user';
import { Notebook, NotebookRole } from './type';

// ********************************************************************************
// given a Notebook, return the Map of shared UserIdentifiers to NotebookRole
export const getNotebookShareRoles = (notebook: Notebook): Map<UserIdentifier, NotebookRole> => {
  const userRoles = new Map<UserIdentifier, NotebookRole>();

  // add the Users in ascending role order
  notebook.viewers.forEach(userId => userRoles.set(userId, NotebookRole.Viewer));
  notebook.editors.forEach(userId => userRoles.set(userId, NotebookRole.Editor));
  userRoles.set(notebook.createdBy, NotebookRole.Creator);

  return userRoles;
};

// --------------------------------------------------------------------------------
// Given two maps of UserIdentifiers to NotebookRole, return a boolean indicating if
// the two maps have the same values.
export const areNotebookShareRolesEqual = (a: Map<UserIdentifier, NotebookRole>, b: Map<UserIdentifier, NotebookRole>): boolean => {
  // have the same number of entries
  if(a.size !== b.size) return false;

  // check each entry
  // NOTE: using for instead of forEach for performance
  for(const [userId, role] of a) {
    if(!b.has(userId) || b.get(userId) !== role) return false;
  }

  // all entries are equal
  return true;
};
