import { ShareRole } from '../util/share';
import { UserIdentifier } from '../util/user';
import { Label } from './type';

// ********************************************************************************
// given a Label, return the Map of shared UserIdentifiers to ShareRole
export const getLabelShareRoles = (label: Label): Map<UserIdentifier, ShareRole> => {
  const userRoles = new Map<UserIdentifier, ShareRole>();

  // add the Users in ascending role order
  label.viewers.forEach(userId => userRoles.set(userId, ShareRole.Viewer));
  label.editors.forEach(userId => userRoles.set(userId, ShareRole.Editor));
  userRoles.set(label.createdBy, ShareRole.Creator);

  return userRoles;
};
