import { UserRole, UserRoles } from './type';

// ********************************************************************************
export const userRolesFromRoles = (roles: UserRole[]): UserRoles =>
  roles.reduce((userRoles, role) => ({ ...userRoles, [role]: true/*by contract*/ }), {} as UserRoles);

export const userRolesFromCustomClaims = (customClaims: UserRoles/*may be 'larger'*/ = {}): UserRoles => {
  return Object.values(UserRole).filter(role => customClaims[role])/*only 'true' is allowed so filter out 'false' or 'undefined'*/
                                .reduce((userRoles, role) => ({ ...userRoles, [role]: true/*by contract*/ }), {} as UserRoles);
};

// --------------------------------------------------------------------------------
// NOTE: this specifically only looks at those keys defined by UserRole since the
//       specified objects may be 'greater than' UserRoles (e.g. the Custom Claims
//       from the UserRecord)
export const isRolesChanged = (rolesA: UserRoles, rolesB: UserRoles | undefined): boolean => {
  if(!rolesB) return true/*by definition*/;
  if(rolesA === rolesB) return false/*by definition*/;
  return Object.values(UserRole).some(role => rolesA[role] !== rolesB[role]);
};
