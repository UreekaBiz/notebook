import { NotebookDocumentContent } from '../notebookEditor/proseMirror/document';
import { NotebookSchemaVersion } from '../notebookEditor/proseMirror/schema';
import { Creatable, ObjectTuple, Updatable } from '../util/datastore';
import { UserIdentifier } from '../util/user';
import { Identifier } from '../util/type';

// ********************************************************************************
export enum NotebookType {
  Notebook = 'Notebook'/*default Notebook type (vs., say, 'Blog')*/,
}

// == Notebook ====================================================================
/** @see {@link Notebook#name} */
export const DEFAULT_NOTEBOOK_NAME = 'Untitled';

// ................................................................................
export type NotebookIdentifier = Identifier;

/** the maximum number of Users that any Notebook may be shared with. This limit is
 *  to both satisfy Collaboration constraints and to keep the size of the Notebook
 *  document small. */
// NOTE: if increased then move share Users to a separate sub-collection
export const MAX_NOTEBOOK_SHARE_USERS = 10;
export type Notebook = Creatable & Updatable & Readonly<{
  /** {@link NotebookType} set on creation only */
  type: NotebookType;
  /** the {@link NotebookSchemaVersion} of this Notebook set on creation only (or
   *  possibly during a migration) */
  schemaVersion: NotebookSchemaVersion;

  // NOTE: because Firestore does not have 'OR' queries, 'viewers' contains *all*
  //       Users that can view the Notebook (including Creators and Editors) so
  //       that it is a single source of truth. The same is true for 'editors'
  //       which also contains the Creators of the Notebook.
  /** the set of User's that can view this Notebook. The creator and all editors are
   *  contained in this set. Bounded by {@link #MAX_NOTEBOOK_SHARE_USERS}.
   *  @see #getNotebookShareRoles() */
  viewers: UserIdentifier[]/*effectively an unordered set*/;
  /** the set of User's that can edit this Notebook. The creator is contained in
   *  this set. Bounded by {@link #MAX_NOTEBOOK_SHARE_USERS}.
   *  @see #getNotebookShareRoles() */
  editors: UserIdentifier[]/*effectively an unordered set*/;

  /** name of the Notebook as shown in a Notebook-list view limited to at most 1024
   *  characters. Can be modified at any time.
   *  @see #DEFAULT_NOTEBOOK_NAME  */
  name: string;

  /** at this time, Notebooks are soft-deleted to allow for a 'Trash'-like concept
   *  (i.e. they are available to be undeleted as need be) */
  // TODO: think about if there is a time-limit after which they are hard deleted
  deleted: boolean;
}>;
export type NotebookTuple = ObjectTuple<NotebookIdentifier, Notebook>;

// ................................................................................
// these are used when communicating the the shared state of a Notebook. They get
// translated into Notebook#viewers and Notebook#editors
export enum NotebookRole {
  /** a Creator is an Editor and a Viewer */
  Creator = 'creator',
  /** an Editor is a Viewer */
  Editor = 'editor',
  Viewer = 'viewer',
}

// == Published Notebook ==========================================================
export type PublishedNotebookIdentifier = Identifier;

// NOTE: document Id is the same as the NotebookIdentifier that generated it
export type PublishedNotebook = Creatable & Updatable & Readonly<{
  /** {@link NotebookVersion} index that this Published Notebook corresponds to */
  version: number;

  image?: string;
  snippet?: string;
  title: string;

  content: NotebookDocumentContent;
}>;
export type PublishedNotebookTuple = ObjectTuple<PublishedNotebookIdentifier, PublishedNotebook>;
