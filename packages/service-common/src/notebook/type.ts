import { LabelIdentifier } from '../label/type';
import { NotebookDocumentContent } from '../notebookEditor/proseMirror/document';
import { NotebookSchemaVersion } from '../notebookEditor/proseMirror/schema';
import { Creatable, ObjectTuple, Updatable } from '../util/datastore';
import { ShareRole } from '../util/share';
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

// ................................................................................
/** the maximum number of Hashtags that any Notebook may have. This limit is to
 *  create a sense of scarcity to ensure that the Hashtags are meaningful. It also
 *  keeps the size of the document small. */
export const MAX_NOTEBOOK_HASHTAGS = 10;

/** the maximum number of Users that any Notebook may be shared with. This limit is
 *  to both satisfy Collaboration constraints and to keep the size of the Notebook
 *  document small. */
// NOTE: if increased then move share Users to a separate sub-collection
export const MAX_NOTEBOOK_SHARE_USERS = 10;

// --------------------------------------------------------------------------------
export type Notebook = Creatable & Updatable & Readonly<{ /*Firestore*/
  /** {@link NotebookType} set on creation only */
  type: NotebookType/*write-once-on-create server-written*/;
  /** the {@link NotebookSchemaVersion} of this Notebook set on creation only (or
   *  possibly during a migration) */
  schemaVersion: NotebookSchemaVersion/*write-once-on-create(-or-migration) server-written*/;

  /** name of the Notebook as shown in a Notebook-list view limited to at most 1024
   *  characters. Can be modified at any time.
   *  @see #DEFAULT_NOTEBOOK_NAME  */
  name: string/*write-many server-written*/;

  /** set of normalized hashtags associated with the Notebook. Hashtags become part
   *  of a Published Notebook (i.e. they become public when published) */
  hashtags: string[]/*write-many server-written*/;
  // NOTE: Labels are *not* stored in the Notebook document. Instead, Notebooks are
  //       stored in the Label document. This is necessary since Notebooks within a
  //       Label may be ordered. (It also keeps the Notebook document small.)

  /** has this Notebook been published? If published then a separate (public)
   *  Published document exists. Notebooks are not published by default. */
  isPublished: boolean/*write-many server-written*/;

  // NOTE: because Firestore does not have 'OR' queries, 'viewers' contains *all*
  //       Users that can view the Notebook (including Creators and Editors) so
  //       that it is a single source of truth. The same is true for 'editors'
  //       which also contains the Creators of the Notebook.
  /** the set of User's that can view this Notebook. The creator and all editors are
   *  contained in this set. Bounded by {@link #MAX_NOTEBOOK_SHARE_USERS}.
   *  @see #getNotebookShareRoles() */
  viewers: UserIdentifier[]/*effectively an unordered set*//*write-many server-written*/;
  /** the set of User's that can edit this Notebook. The creator is contained in
   *  this set. Bounded by {@link #MAX_NOTEBOOK_SHARE_USERS}.
   *  @see #getNotebookShareRoles() */
  editors: UserIdentifier[]/*effectively an unordered set*//*write-many server-written*/;

  /** at this time, Notebooks are soft-deleted to allow for a 'Trash'-like concept
   *  (i.e. they are available to be undeleted as need be) */
  // TODO: think about if there is a time-limit after which they are hard deleted
  deleted: boolean;
}>;
export type NotebookTuple = ObjectTuple<NotebookIdentifier, Notebook>;

// -- Version ---------------------------------------------------------------------
// SEE: /notebookEditor/type.ts

// -- Checkpoint ------------------------------------------------------------------
// SEE: /notebookEditor/type.ts

// -- Label User Share ------------------------------------------------------------
// a Notebook sub-collection of Users that have some permissions to the Notebook.
// The document ID is a the User identifier so that Firestore Rules can check for
// the existence of a Notebook-User share (via either a Label or the Notebook itself)
// NOTE: documents are always fully written on any change to the role
export type NotebookLabelUser = Creatable & Readonly<{ /*Firestore*/
  /** the parent Notebook (for convenience when indexing) */
  notebookId: NotebookIdentifier;
  /** the identifier of the User that the Notebook is shared with via Label(s)
   *  @see Label#viewers
   *  @see Label#editors */
  userId: UserIdentifier;

  /** a set of Label-ShareRole pairs for this Notebook-User */
  labels: Record<LabelIdentifier, ShareRole>;
}>;

// == Notebook Published ==========================================================
/** a Published {@link Notebook}. This is a separate document to allow Notebooks to
 *  be edited while they are published. Also, there are two records: one with content
 *  and one with out. The former is used when displaying the content. The latter is
 *  used in list views (since the content may be large!).
 *  If a Notebook is unpublished then this record is removed and any history of
 *  that Published Notebook is lost.
 *  The Author of a Published Notebook is the Creator of the associated Notebook
 *  (regardless of who actually does the Publishing). */
// NOTE: document Id is the same as the NotebookIdentifier that generated it
export type NotebookPublished = Creatable & Updatable & Readonly<{ /*Firestore*/
  /** {@link NotebookVersion} index that this Published Notebook corresponds to */
  versionIndex: number;

  title: string;
  image?: string;
  snippet?: string;

  /** set of normalized hashtags associated with the Published Notebook */
  hashtags: string[]/*write-many server-written*/;

  // NOTE: the content is not stored on this view since it may be large
  // SEE: NotebookPublishedContent
}>;
export type NotebookPublishedTuple = ObjectTuple<NotebookIdentifier, NotebookPublished>;

// SEE: NotebookPublished
export type NotebookPublishedContent = NotebookPublished & Readonly<{ /*Firestore*/
  /** the content as a ProseMirror document */
  content: NotebookDocumentContent;
}>;
export type NotebookPublishedContentTuple = ObjectTuple<NotebookIdentifier, NotebookPublishedContent>;
