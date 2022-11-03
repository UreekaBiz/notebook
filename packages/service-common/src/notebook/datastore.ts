import { SessionIdentifier } from 'authUser';
import { FieldValue } from '../util/firestore';
import { nameof } from '../util/object';
import { DatabaseTimestamp, DeleteRecord } from '../util/rtdb';
import { Modify } from '../util/type';
import { UserIdentifier } from '../util/user';
import { Notebook, NotebookCollaboration, NotebookIdentifier, NotebookLabelUser, NotebookPublished, NotebookPublishedContent, NotebookUserSession, NotebookUserSessions } from './type';

// ** Constants *******************************************************************
// == Firestore ===================================================================
// -- Notebook --------------------------------------------------------------------
export const NOTEBOOKS = 'notebooks'/*top-level collection*/;
export const NOTEBOOK = `${NOTEBOOKS}/{notebookId}` as const/*document (used by CF triggers)*/;

// .. Version .....................................................................
// SEE: /notebookEditor/datastore.ts

// .. Checkpoint ..................................................................
// SEE: /notebookEditor/datastore.ts

// .. Label User Share ............................................................
export const LABEL_NOTEBOOK_USERS = 'notebook-label-users'/*sub-collection*/;
export const LABEL_NOTEBOOK_USER = `${NOTEBOOK}/${LABEL_NOTEBOOK_USERS}/{userId}` as const/*document (used by CF triggers)*/;

// -- Notebook Published ----------------------------------------------------------
// NOTE: each Notebook has at most one Published Notebook at any point
// NOTE: terrible English but consistent naming
export const NOTEBOOK_PUBLISHEDS = 'notebook-publisheds'/*top-level collection*/;
export const NOTEBOOK_PUBLISHED = `${NOTEBOOK_PUBLISHEDS}/{notebookId}` as const/*document (used by CF triggers)*/;

export const NOTEBOOK_PUBLISHED_CONTENTS = 'notebook-published-contents'/*top-level collection*/;
export const NOTEBOOK_PUBLISHED_CONTENT = `${NOTEBOOK_PUBLISHED_CONTENTS}/{notebookId}` as const/*document (used by CF triggers)*/;

// == RTDB ========================================================================
// -- Notebook --------------------------------------------------------------------
export const NOTEBOOKS_RTDB = 'notebooks'/*top-level collection*/;
export const NOTEBOOK_USERS = `${NOTEBOOKS_RTDB}/{notebookId}` as const/*sub-collection'*/;
export const NOTEBOOK_USER_SESSIONS = `${NOTEBOOK_USERS}/{userId}` as const/*sub-collection'*/;
export const NOTEBOOK_USER_SESSION = `${NOTEBOOK_USER_SESSIONS}/{sessionId}` as const/*'document'*/;

// ** Storage Types ***************************************************************
// == Firestore ===================================================================
// -- Notebook --------------------------------------------------------------------
export type Notebook_Storage = Notebook/*nothing additional*/;

// .. Version .....................................................................
// SEE: /notebookEditor/datastore.ts

// .. Checkpoint ..................................................................
// SEE: /notebookEditor/datastore.ts

// .. Label User Share ............................................................
export type NotebookLabelUser_Storage = NotebookLabelUser/*nothing additional*/;

// -- Notebook Published ----------------------------------------------------------
export type NotebookPublished_Storage = NotebookPublished/*nothing additional*/;
export type NotebookPublishedContent_Storage = NotebookPublishedContent/*nothing additional*/;

// == RTDB ========================================================================
// -- Notebook --------------------------------------------------------------------
// NOTE: Firebase recommended approach for updating RTDB fields (i.e. update by key)
export const notebooksKey = `/${NOTEBOOKS_RTDB}` as const;
export const relativeNotebookKey = (notebookId: NotebookIdentifier) => `/${notebookId}` as const;
export const notebooksNotebookKey = (notebookId: NotebookIdentifier) => `${notebooksKey}${relativeNotebookKey(notebookId)}` as const;
export const relativeUserKey = (userId: UserIdentifier) => `/${userId}` as const;
export const relativeNotebookUserKey = (notebookId: NotebookIdentifier, userId: UserIdentifier) => `${relativeNotebookKey(notebookId)}${relativeUserKey(userId)}` as const;
export const notebooksNotebookUserKey = (notebookId: NotebookIdentifier, userId: UserIdentifier) => `${notebooksKey}${relativeNotebookUserKey(notebookId, userId)}` as const;
export const relativeSessionKey = (sessionId: SessionIdentifier) => `/${sessionId}` as const;
export const relativeUserSessionKey = (userId: UserIdentifier, sessionId: SessionIdentifier) => `${relativeUserKey(userId)}${relativeSessionKey(sessionId)}` as const;
export const relativeNotebookUserSessionKey = (notebookId: NotebookIdentifier, userId: UserIdentifier, sessionId: SessionIdentifier) => `${relativeNotebookKey(notebookId)}${relativeUserSessionKey(userId, sessionId)}` as const;
export const notebooksNotebookUserSessionKey = (notebookId: NotebookIdentifier, userId: UserIdentifier, sessionId: SessionIdentifier) => `${notebooksKey}${relativeNotebookUserSessionKey(notebookId, userId, sessionId)}` as const;
export const relativeCursorPositionKey = (notebookId: NotebookIdentifier, userId: UserIdentifier, sessionId: SessionIdentifier) => `${relativeNotebookUserSessionKey(notebookId, userId, sessionId)}/${nameof<NotebookUserSession>('cursorPosition')}` as const;
export const relativeTimestampKey = (notebookId: NotebookIdentifier, userId: UserIdentifier, sessionId: SessionIdentifier) => `${relativeNotebookUserSessionKey(notebookId, userId, sessionId)}/${nameof<NotebookUserSession>('timestamp')}` as const;

// ................................................................................
export type NotebookCollaboration_Storage = NotebookCollaboration/*nothing additional*/;
export type NotebookUserSessions_Storage = NotebookUserSessions/*nothing additional*/;
export type NotebookUserSession_Storage = NotebookUserSession/*nothing additional*/;

// ** Action Types ****************************************************************
// == Firestore ===================================================================
// -- Notebook --------------------------------------------------------------------
export type Notebook_Create = Modify<Notebook_Storage, Readonly<{
  createTimestamp: FieldValue/*always-write server-set*/;
  updateTimestamp: FieldValue/*always-write server-set*/;
}>>;

export type Notebook_Hashtag = Modify<Pick<Notebook_Storage, 'hashtags' | 'updateTimestamp' | 'lastUpdatedBy'>, Readonly<{
  updateTimestamp: FieldValue/*always-write server-set*/;
}>>;
export type Notebook_Publish = Modify<Pick<Notebook_Storage, 'isPublished' | 'updateTimestamp' | 'lastUpdatedBy'>, Readonly<{
  updateTimestamp: FieldValue/*always-write server-set*/;
}>>;
export type Notebook_Rename = Modify<Pick<Notebook_Storage, 'name' | 'updateTimestamp' | 'lastUpdatedBy'>, Readonly<{
  updateTimestamp: FieldValue/*always-write server-set*/;
}>>;
export type Notebook_Share = Modify<Pick<Notebook_Storage, 'editors' | 'viewers' | 'updateTimestamp' | 'lastUpdatedBy'>, Readonly<{
  updateTimestamp: FieldValue/*always-write server-set*/;
}>>;

export type Notebook_Delete = Modify<Pick<Notebook_Storage, 'deleted' | 'updateTimestamp' | 'lastUpdatedBy'>, Readonly<{
  updateTimestamp: FieldValue/*always-write server-set*/;
}>>;

// .. Version .....................................................................
// SEE: /notebookEditor/datastore.ts

// .. Checkpoint ..................................................................
// SEE: /notebookEditor/datastore.ts

// .. Label User Share ............................................................
// always written as if new (i.e. always completely overwritten)
export type NotebookLabelUser_Write = Modify<NotebookLabelUser_Storage, Readonly<{
  createTimestamp: FieldValue/*always-write server-set*/;
}>>;
// NOTE: hard-delete so no delete Action Type

// -- Notebook Published ----------------------------------------------------------
export type NotebookPublished_Create = Modify<NotebookPublished_Storage, Readonly<{
  createTimestamp: FieldValue/*always-write server-set*/;
  updateTimestamp: FieldValue/*always-write server-set*/;
}>>;
export type NotebookPublished_Update = Modify<Omit<NotebookPublished_Storage, 'createdBy' | 'createTimestamp'>, Readonly<{
  updateTimestamp: FieldValue/*always-write server-set*/;
}>>;
// NOTE: hard-delete so no delete Action Type

export type NotebookPublishedContent_Create = Modify<NotebookPublishedContent_Storage, Readonly<{
  createTimestamp: FieldValue/*always-write server-set*/;
  updateTimestamp: FieldValue/*always-write server-set*/;
}>>;
export type NotebookPublishedContent_Update = Modify<Omit<NotebookPublishedContent_Storage, 'createdBy' | 'createTimestamp'>, Readonly<{
  updateTimestamp: FieldValue/*always-write server-set*/;
}>>;
// NOTE: hard-delete so no delete Action Type

// == RTDB ========================================================================
// -- Notebook --------------------------------------------------------------------
// NOTE: although this is technically a Notebook-centric action, it is commonly used
//       at the Editor level (e.g. to know when and where Users are within the Editor).
//       It remains here for consistency.
export type NotebookUserSession_Write = Modify<Partial<NotebookUserSession_Storage>, Readonly<{
  timestamp: DatabaseTimestamp/*server-set*/;
}>>;

// CHECK: what the naming of this should be isn't obvious (structure vs. field)
export type NotebookUserSessions_Delete = Modify<NotebookUserSessions_Storage, Readonly<{
  [sessionId: string/*SessionIdentifier*/]: NotebookUserSession | typeof DeleteRecord/*delete*/;
}>>;
