import { NotebookIdentifier } from '../notebook/type';
import { Creatable, ObjectTuple, Updatable } from '../util/datastore';
import { Identifier } from '../util/type';
import { UserIdentifier } from '../util/user';

// ********************************************************************************
// NOTE: Label documentIds are raw Firestore (random) Document Ids
export type LabelIdentifier = Identifier;

// --------------------------------------------------------------------------------
// Labels don't have to be unique so this simply removes leading / trailing whitespace
// as well as any duplicate whitespace
export const normalizeLabel = (name: string) =>
  name.trim().replace(/\s+/g, ' ');

// == Label (Firestore) ===========================================================
export enum LabelVisibility {
  Private = 'private',
  Public = 'public',
}

// ................................................................................
/** the maximum number of Users that any Label may be shared with. This limit is
 *  to keep the size of the Label document bounded and small. */
// NOTE: if increased then move share Users to a separate sub-collection
export const MAX_LABEL_SHARE_USERS = 10;

/** the maximum number of Notebooks that any Label may be shared with. This limit
 *  is to keep the size of the Label document bounded and small. */
// NOTE: if increased then move Notebooks to a separate sub-collection
export const MAX_LABEL_NOTEBOOKS = 100;

// --------------------------------------------------------------------------------
// NOTE: Labels (and all dependent documents) are *hard* deleted
export type Label = Creatable & Updatable & Readonly<{ /*Firestore*/
  /** the name of the Label (non-normalized, etc) */
  name: string/*write-many server-written*/;
  /** the optional Label description */
  description?: string/*write-many server-written*/;

  /** the Visibility of this Label. If a Label is Public then it will have a
   *  corresponding LabelPublished structure and document. */
  // NOTE: this is used by Firestore Rules to determine access to the Label
  visibility: LabelVisibility/*write-many server-written*/;

  /** `true` if this Label represents an ordered collection. By default, Notebooks
   *   are ordered by when they were added to this Label. */
  ordered: boolean/*write-many server-written*/;
  /** the (ordered) list of non-deleted {@link NotebookIdentifier}'s associated
   *  with this Label. Bounded by {@link #MAX_LABEL_NOTEBOOKS}. */
  notebookIds: NotebookIdentifier[]/*write-many server-written*/;

  // NOTE: because Firestore does not have 'OR' queries, 'viewers' contains *all*
  //       Users that can view associated Notebooks (including Editors) so that it
  //       is a single source of truth for this Label.
  /** the set of User's that can view this Label and any associated Notebooks. All
   *  editors are also contained in this set. Bounded by {@link #MAX_LABEL_SHARE_USERS}.
   *  @see #getLabelShareRoles() */
  viewers: UserIdentifier[]/*effectively an unordered set*//*write-many server-written*/;
  /** the set of User's that can edit this Label and any associated Notebooks.
   *  Bounded by {@link #MAX_LABEL_SHARE_USERS}.
   *  @see #getLabelShareRoles() */
  editors: UserIdentifier[]/*effectively an unordered set*//*write-many server-written*/;

  /** in order to support fast prefix (typeahead find) searches, at most
   *  #MAX_PREFIX_COUNT normalized prefixes of the Label's name */
  searchNamePrefixes: string[]/*write-many server-written*/;
  /** normalized name expressly for sorting
   *  @see #labelComparator */
  sortName: string/*write-many server-written*/;
}>;
export type LabelTuple = ObjectTuple<LabelIdentifier, Label>;

// -- Label Published (Firestore) -------------------------------------------------
// to ensure that no internal information (e.g. viewer/editor lists) is exposed to
// public Users, this copy of Label (where `visibility === 'public'`) is created
// NOTE: the document ID is the Label Identifier
// NOTE: these are not Updatable as there is no notion of 'first made visible' as
//       there is with Notebooks and 'first published'
// NOTE: documents are always fully written on any change to a public Label
export type LabelPublished = Creatable & Readonly<{ /*Firestore*/
  /** the name of the Label (non-normalized, etc) */
  name: string/*write-many server-written*/;

  /** `true` if this Label represents an ordered collection. By default, Notebooks
   *   are ordered by when they were added to this Label. */
  ordered: boolean/*write-many server-written*/;
  /** the (ordered) list of non-deleted and published {@link NotebookIdentifier}'s
   *  associated with this Label. Bounded by {@link #MAX_LABEL_NOTEBOOKS}. */
  notebookIds: NotebookIdentifier[]/*write-many server-written*/;

  /** in order to support fast prefix (typeahead find) searches, at most
   *  #MAX_PREFIX_COUNT normalized prefixes of the Label's name */
  searchNamePrefixes: string[]/*write-many server-written*/;
  /** normalized name expressly for sorting
   *  @see #labelComparator */
  sortName: string/*write-many server-written*/;
}>;
export type LabelPublishedTuple = ObjectTuple<LabelIdentifier, LabelPublished>;
