import { FieldValue } from '../util/firestore';
import { Identifier, Modify } from '../util/type';
import { Version, WebVersion } from './type';

// ** Constants *******************************************************************
// == Firestore ===================================================================
// -- Version ---------------------------------------------------------------------
export const VERSIONS = 'versions'/*top-level collection*/;
export const VERSION = `${VERSIONS}/{id}` as const/*document (used by CF triggers)*/;

// .. Trigger Context .............................................................
export type VersionParams = Readonly<{
  id/*NOTE: must match #VERSION*/: Identifier;
}>;

// ** Storage Types ***************************************************************
// == Firestore ===================================================================
// -- Version -----------------------------------------------------------------------
export type Version_Storage = Version/*nothing additional*/;

// ** Action Types ****************************************************************
// == Firestore ===================================================================
// -- Version -----------------------------------------------------------------------
// NOTE: all changes are inserts
export type Version_Write = Modify<Version_Storage, Readonly<{
  web: WebVersion | FieldValue/*delete*/ | undefined/*doesn't exist*/;

  updateTimestamp: FieldValue/*always-write server-set*/;
}>>;
