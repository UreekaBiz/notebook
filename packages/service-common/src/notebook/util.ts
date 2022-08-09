import { ShareRole } from '../util/share';
import { UserIdentifier } from '../util/user';
import { Notebook } from './type';

// ********************************************************************************
// returns the Map of shared UserIdentifiers to ShareRole for the specified Notebook
export const getNotebookShareRoles = (notebook: Notebook): Map<UserIdentifier, ShareRole> => {
  const userRoles = new Map<UserIdentifier, ShareRole>();

  // add the Users in ascending role order
  notebook.viewers.forEach(userId => userRoles.set(userId, ShareRole.Viewer));
  notebook.editors.forEach(userId => userRoles.set(userId, ShareRole.Editor));
  userRoles.set(notebook.createdBy, ShareRole.Creator);

  return userRoles;
};

// --------------------------------------------------------------------------------
// return `true` if the two maps are contain the same Users and Roles
export const areNotebookShareRolesEqual = (a: Map<UserIdentifier, ShareRole>, b: Map<UserIdentifier, ShareRole>): boolean => {
  // have the same number of entries
  if(a.size !== b.size) return false;

  // check each entry
  // NOTE: using 'for' instead of 'forEach' for performance
  for(const [userId, role] of a) {
    if(!b.has(userId) || b.get(userId) !== role) return false/*differs -- early exit*/;
  }

  // all entries are equal
  return true;
};
