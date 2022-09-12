import { SessionIdentifier } from 'authUser';
import { FieldValue } from '../util/firestore';
import { nameof } from '../util/object';
import { DatabaseTimestamp } from '../util/rtdb';
import { Modify } from '../util/type';
import { UserIdentifier } from '../util/user';
import { Notebook, NotebookIdentifier, NotebookLabelUser, NotebookPublished, NotebookPublishedContent, NotebookUserSession } from './type';

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
export const notebookKey = (notebookId: NotebookIdentifier) => `/${NOTEBOOKS_RTDB}/${notebookId}`;
export const notebookUserKey = (notebookId: NotebookIdentifier, userId: UserIdentifier) => `${notebookKey(notebookId)}/${userId}`;
export const notebookUserSessionKey = (notebookId: NotebookIdentifier, userId: UserIdentifier, sessionId: SessionIdentifier) => `${notebookUserKey(notebookId, userId)}/${sessionId}`;
export const cursorPositionKey = (notebookId: NotebookIdentifier, userId: UserIdentifier, sessionId: SessionIdentifier) => `${notebookUserSessionKey(notebookId, userId, sessionId)}/${nameof<NotebookUserSession>('cursorPosition')}`;
export const timestampKey = (notebookId: NotebookIdentifier, userId: UserIdentifier, sessionId: SessionIdentifier) => `${notebookUserSessionKey(notebookId, userId, sessionId)}/${nameof<NotebookUserSession>('timestamp')}`;

// ................................................................................
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
export type NotebookUserSession_Write = Modify<Partial<NotebookUserSession_Storage>, Readonly<{
  timestamp: DatabaseTimestamp/*server-set*/;
}>>;
