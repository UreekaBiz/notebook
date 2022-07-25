import { NotebookSchemaVersion } from '../notebook/type';
import { Creatable } from '../util/datastore';
import { hashNumber } from '../util/hash';
import { Identifier } from '../util/type';
import { UserIdentifier } from '../util/user';
import { NodeContent } from './proseMirror/node';

// ********************************************************************************
// identifies the Client / Session that made the Versions from a given Editor
// CHECK: replace with UserIdentifier + SessionIdentifier? At a minimum this *must*
//        be UserIdentifier. But is the additional session granularity useful / needed?
export type ClientIdentifier = UserIdentifier;

// == Document ====================================================================
export type NotebookDocumentContent = NodeContent/*alias*/;

// == Version =====================================================================
// identifies when there is no NotebookVersion yet. It is also the starting value
// for the indexing of the NotebookVersions. The first index is NO_NOTEBOOK_VERSION + 1.
export const NO_NOTEBOOK_VERSION = 0;

// --------------------------------------------------------------------------------
export type NotebookVersionIdentifier = Identifier/*hashed version index*/;
export const generateNotebookVersionIdentifier = (index: number): NotebookVersionIdentifier => hashNumber(index)/*explicitly needs to be string-based hashing for consistency!*/;

export type NotebookVersionContent = NodeContent/*alias*/;

// --------------------------------------------------------------------------------
// NOTE: document ID is NotebookVersion#index (string-hashed)
// NOTE: because this is written by the client, any fields that are added need to be
//       considered for validation in Firestore Rules
// SEE: firestore.rules:/notebooks/notebooks-versions
export type NotebookVersion = Creatable & Readonly<{
  /** the {@link NotebookSchemaVersion} of this Checkpoint */
  schemaVersion: NotebookSchemaVersion;

  /** the ProseMirror Step version of this Version. It is effectively a Lamport
   *  Timestamp. It must start at INITIAL_DOCUMENT_INDEX and increase monotonically */
  index: number;
  /** Content is the stringified JSON of a ProseMirror Step */
  content: NotebookVersionContent;
}>;

// == Checkpoint ==================================================================
export type CheckpointIdentifier = Identifier;
export const generateCheckpointIdentifier = (index: number): CheckpointIdentifier => hashNumber(index)/*explicitly needs to be string-based hashing for consistency!*/;

// --------------------------------------------------------------------------------
// NOTE: document ID is Checkpoint#index (string-hashed)
// NOTE: in general, the system creates Checkpoints on a regular basis but in the
//       future it may be that User-initiated events will create Checkpoints
// SEE: NOTEBOOK_CHECKPOINT_N_VERSIONS
// SEE: firestore.rules:/notebooks/notebooks-checkpoints
export type Checkpoint = Creatable & Readonly<{
  /** the {@link NotebookSchemaVersion} of this Checkpoint */
  schemaVersion: NotebookSchemaVersion;

  /** {@link Version} index that this Checkpoint corresponds to */
  index: number;
  /** Content is the stringified JSON of a ProseMirror Document */
  content: NotebookDocumentContent;
}>;
