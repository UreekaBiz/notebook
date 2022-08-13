import { ShareRole } from '../util/share';
import { assertNever } from '../util/type';
import { UserIdentifier } from '../util/user';
import { Label } from './type';

// TODO: refactor into a 'Sharable' interface
// ********************************************************************************
// == Permission ==================================================================
export const isLabelCreator = (userId: UserIdentifier, label: Label): boolean =>
  (label.createdBy === userId);
export const isLabelEditor = (userId: UserIdentifier, label: Label): boolean =>
  label.editors.includes(userId) || isLabelCreator(userId, label)/*pedantic*/;
export const isLabelViewer = (userId: UserIdentifier, label: Label): boolean =>
  label.viewers.includes(userId) || label.editors.includes(userId)/*pedantic*/ || isLabelCreator(userId, label)/*pedantic*/;

export const isLabelRole = (userId: UserIdentifier, label: Label, role: ShareRole): boolean => {
  switch(role) {
    case ShareRole.Creator: return isLabelCreator(userId, label);
    case ShareRole.Editor:  return isLabelEditor(userId, label);
    case ShareRole.Viewer:  return isLabelViewer(userId, label);
    default: return assertNever(role);
  }
};

// == Share =======================================================================
// given a Label, return the Map of shared UserIdentifiers to ShareRole
export const getLabelShareRoles = (label: Label): Map<UserIdentifier, ShareRole> => {
  const userRoles = new Map<UserIdentifier, ShareRole>();

  // add the Users in ascending role order
  label.viewers.forEach(userId => userRoles.set(userId, ShareRole.Viewer));
  label.editors.forEach(userId => userRoles.set(userId, ShareRole.Editor));
  userRoles.set(label.createdBy, ShareRole.Creator);

  return userRoles;
};
