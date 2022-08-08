import { NotebookIdentifier, PublishedNotebookIdentifier } from '@ureeka-notebook/web-service';

// FIXME: Find a better way to share routes!
// NOTE: This routes are used also on the client-side, when modifying any of the
//       routes make sure that the client-side routes are also modified.
// ********************************************************************************
// == Root Routes =================================================================
const root = '/' as const;
export const notebookRootRoute = `${root}notebook/` as const;
export const publishedNotebookRootRoute = `${root}published/` as const;
export const settingsRootRoute = `${root}settings/` as const;

// == Routes ======================================================================
// -- Core ------------------------------------------------------------------------
export const coreRoutes = {
  root,
  login:'/login',
  logout:'/logout',

  notebook: notebookRootRoute,

  publishedNotebook: publishedNotebookRootRoute,

  settings: settingsRootRoute,
} as const;

// == Notebook ====================================================================
// -- Notebook --------------------------------------------------------------------
export const publishedNotebookRoutes = {
  root: publishedNotebookRootRoute,

  publishedNotebook: `${publishedNotebookRootRoute}:publishedNotebookId`,
} as const;
export const publishedNotebookRoute = (publishedNotebookId: PublishedNotebookIdentifier) => `${publishedNotebookRoutes.root}${publishedNotebookId}`;

// -- Notebook Editor --------------------------------------------------------------
export const notebookRoutes = {
  root: notebookRootRoute,

  notebook: `${notebookRootRoute}:notebookId`,
} as const;
export const notebookRoute = (notebookId: NotebookIdentifier) => `${notebookRoutes.root}${notebookId}`;

// == User ========================================================================
// -- Settings --------------------------------------------------------------------
export const settingsRoutes = {
  root: settingsRootRoute,

  apiKey: `${settingsRootRoute}api-key`,
};
