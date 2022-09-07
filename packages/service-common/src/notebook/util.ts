import { ShareRole } from '../util/share';
import { assertNever } from '../util/type';
import { UserIdentifier } from '../util/user';
import { Notebook } from './type';

// TODO: refactor into a 'Sharable' interface
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

// ................................................................................
// same as above but with no waterfall
export const isNotebookCreatorStrict = (userId: UserIdentifier, notebook: Notebook): boolean =>
  (notebook.createdBy === userId);
export const isNotebookEditorStrict = (userId: UserIdentifier, notebook: Notebook): boolean =>
  notebook.editors.includes(userId) && !isNotebookCreator(userId, notebook);
export const isNotebookViewerStrict = (userId: UserIdentifier, notebook: Notebook): boolean =>
  notebook.viewers.includes(userId) && !isNotebookEditorStrict(userId, notebook)/*also confirms not Creator*/;

// == Share =======================================================================
// returns the Map of shared UserIdentifiers to ShareRole for the specified Notebook
export const getNotebookShareRoles = (notebook: Notebook): Map<UserIdentifier, ShareRole> => {
  const userRoles = new Map<UserIdentifier, ShareRole>();

  // add the Users in ascending role order so it results in the User having the
  // 'highest' role
  notebook.viewers.forEach(userId => userRoles.set(userId, ShareRole.Viewer));
  notebook.editors.forEach(userId => userRoles.set(userId, ShareRole.Editor));
  userRoles.set(notebook.createdBy, ShareRole.Creator);

  return userRoles;
};

// ................................................................................
// the number of Users (other than the Creator) that have access to the Notebook
export const getNotebookShareCount = (notebook: Notebook): number =>
  notebook.viewers.length/*contains every Share*/ - 1/*Creator*/;

// returns the count of Viewers and Editors for the specified Notebook
// NOTE: there is always one and only one Creator so not explicitly counted / returned
export const getNotebookShareCounts = (notebook: Notebook): Readonly<{ viewers: number; editors: number; }> => {
  const creators = new Set([notebook.createdBy]),
        editors  = new Set(notebook.editors.filter(userId => !creators.has(userId))),
        viewers  = new Set(notebook.viewers.filter(userId => !editors.has(userId) && !creators.has(userId)));
  return {
    viewers: viewers.size,
    editors: editors.size,
  };
};
