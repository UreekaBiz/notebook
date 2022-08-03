import { Creatable, Updatable } from '../util/datastore';
import { Identifier } from '../util/type';
import { UserIdentifier } from '../util/user';

// ********************************************************************************
// NOTE: Label documentIds are raw Firestore (random) Document Ids
export type LabelIdentifier = Identifier;

// == Label (Firestore) ===========================================================
export enum LabelVisibility {
  Private = 'private',
  Public = 'public',
}

// --------------------------------------------------------------------------------
// NOTE: Labels (and all dependent documents) are *hard* deleted
export type Label = Creatable & Updatable & Readonly<{ /*Firestore*/
  /** the name of the Label (non-normalized, etc) */
  name: string/*write-many server-written*/;

  /** the Visibility of this Label. If a Label is Public then it will have a
   *  corresponding LabelPublished structure and document. */
  // NOTE: this is used by Firestore Rules to determine access to the Label
  visibility: LabelVisibility/*write-many server-written*/;

  /** `true` if this Label represents an ordered collection. By default, Notebooks
   *   are ordered by when they were added to this Label. */
  ordered: boolean/*write-many server-written*/;

  // NOTE: because Firestore does not have 'OR' queries, 'viewers' contains *all*
  //       Users that can view associated Notebooks (including Editors) so that it
  //       is a single source of truth for this Label.
  /** the set of User's that can view Notebooks associated with this Label. All
   *  editors are also contained in this set. Bounded by {@link #MAX_NOTEBOOK_SHARE_USERS}.
   *  @see #getNotebookShareRoles() */
  notebookViewers: UserIdentifier[]/*effectively an unordered set*//*write-many server-written*/;
  /** the set of User's that can edit Notebooks associated with this Label. Bounded
   *  by {@link #MAX_NOTEBOOK_SHARE_USERS}.
   *  @see #getNotebookShareRoles() */
  notebookEditors: UserIdentifier[]/*effectively an unordered set*//*write-many server-written*/;

  /** in order to support fast prefix (typeahead find) searches, at most
   *  #MAX_PREFIX_COUNT normalized prefixes of the Label's name */
  searchNamePrefixes: string[]/*write-many server-written*/;
  /** normalized name expressly for sorting
   *  @see #labelComparator */
  sortName: string/*write-many server-written*/;
}>;

// ................................................................................
// a sub-collection of Labels whose document ID is the Notebook Identifier. The
// number of Notebooks for a given Label is reflected in the corresponding
// LabelSummary (in RTDB)
export type LabelNotebook = Updatable & Readonly<{ /*Firestore*/
  /** the parent Label (for convenience when indexing) */
  labelId: LabelIdentifier/*write-once server-written*/;
  /** the Notebook (for convenience when indexing) */
  notebookId: Identifier/*write-once server-written*/;

  /** the Label's name to facilitate collection-group queries
   *  @see Label#name */
  name: string/*write-many server-written*/;

  /** the Notebook's order within the Label. For unordered Labels, this is unused
   *  but still has a valid value. This value is *not* explicitly dense -- it may
   *  be sparse. */
  order: number/*write-many server-written*/;

  /** the Label's viewers to facilitate collection-group queries
   *  @see Label#notebookViewers */
  notebookViewers: UserIdentifier[]/*write-many server-written*/;
  /** the Label's editors to facilitate collection-group queries
   *  @see Label#notebookEditors */
  notebookEditors: UserIdentifier[]/*write-many server-written*/;
}>;

// -- Label Published (Firestore) -------------------------------------------------
// to ensure that no internal information (e.g. viewer/editor lists) is exposed to
// public Users, this copy of Label (where `visibility === 'public'`) is created
// NOTE: the document ID is the Label Identifier
export type LabelPublished = Readonly<{ /*Firestore*/
  /** the name of the Label (non-normalized, etc) */
  name: string/*write-many server-written*/;

  /** `true` if this Label represents an ordered collection. By default, Notebooks
   *   are ordered by when they were added to this Label. */
  ordered: boolean/*write-many server-written*/;

  /** in order to support fast prefix (typeahead find) searches, at most
   *  #MAX_PREFIX_COUNT normalized prefixes of the Label's name */
  searchNamePrefixes: string[]/*write-many server-written*/;
  /** normalized name expressly for sorting
   *  @see #labelComparator */
  sortName: string/*write-many server-written*/;
}>;

// ................................................................................
// the analog of LabelNotebook for Labels that are public *and* Notebooks that are
// Published
// SEE: LabelPublished and LabelNotebook
export type LabelNotebookPublished = Updatable & Readonly<{ /*Firestore*/
  /** the parent public Label (for convenience when indexing) */
  labelId: LabelIdentifier/*write-once server-written*/;
  /** the Published Notebook (for convenience when indexing) */
  notebookId: Identifier/*write-once server-written*/;

  /** the Label's name to facilitate collection-group queries
   *  @see Label#name */
  name: string/*write-many server-written*/;

  /** the LabelNotebook's order
   *  @see LabelNotebook#order */
  order: number/*write-many server-written*/;
}>;

// == Label Summary (RTDB) ========================================================
// SEE: ./datastore.ts: LABEL_SUMMARY
export type LabelSummary = Readonly<{ /*RTDB only*/
  /** the number of Notebooks associated with this Label */
  // NOTE: this is visible to end-Users. If this ever becomes a problem then a
  //       specific Summary for public Labels can be created
  notebook: number/*atomic-increment*/;
  /** the number of Published Notebooks associated with this Label */
  publishedNotebook: number/*atomic-increment*/;
}>;
