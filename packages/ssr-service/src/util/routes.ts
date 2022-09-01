import { LabelIdentifier, NotebookIdentifier } from '@ureeka-notebook/service-common';

// FIXME: Find a better way to share routes!
// NOTE: This routes are used also on the client-side, when modifying any of the
//       routes make sure that the client-side routes are also modified.
// ********************************************************************************
// == Root Routes =================================================================
const root = '/' as const;
export const notebookRootRoute = `${root}notebook` as const;
export const profileRootRoute = `${root}profile` as const;
export const publishedNotebookRootRoute = `${root}published` as const;
export const settingsRootRoute = `${root}settings` as const;

// == Routes ======================================================================
// -- Core ------------------------------------------------------------------------
export const coreRoutes = {
  root,
  login:'/login',
  logout:'/logout',

  notebook: notebookRootRoute,

  profile: profileRootRoute,

  publishedNotebook: publishedNotebookRootRoute,

  settings: settingsRootRoute,
} as const;

// == Auth'd Routes ===============================================================
// -- Notebook Editor -------------------------------------------------------------
export const notebookRoutes = {
  root: notebookRootRoute,

  notebook: `${notebookRootRoute}/:notebookId`,
} as const;
export const notebookRoute = (notebookId: NotebookIdentifier) => `${notebookRoutes.root}/${notebookId}`;

// -- Profile ---------------------------------------------------------------------
export const profileRoutes = {
  root: profileRootRoute,

  notebooks: `${profileRootRoute}/notebooks`,
  collections: `${profileRootRoute}/collections`,
  collection: `${profileRootRoute}/collections/:collectionId`,

  hashtags: `${profileRootRoute}/hashtags`,
};
// CHECK: Should Collections (Label) be part of the Profile?
export const collectionRoute = (labelId: LabelIdentifier) => `${profileRoutes.root}/collections/${labelId}`;

// -- Settings --------------------------------------------------------------------
export const settingsRoutes = {
  root: settingsRootRoute,

  apiKey: `${settingsRootRoute}/api-key`,
};

// == Public Routes ===============================================================
// -- Notebook --------------------------------------------------------------------
// .. Published ...................................................................
export const publishedNotebookRoutes = {
  root: publishedNotebookRootRoute,

  publishedNotebook: `${publishedNotebookRootRoute}/:publishedNotebookId`,
} as const;
export const publishedNotebookRoute = (notebookId: NotebookIdentifier) => `${publishedNotebookRoutes.root}/${notebookId}`;
