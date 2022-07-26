import { AuthedUser } from '../authUser/type';
import { Creatable } from '../util/datastore';
import { hashNumber } from '../util/hash';
import { Identifier } from '../util/type';
import { NotebookDocumentContent } from './proseMirror/document';
import { NodeContent } from './proseMirror/node';
import { NotebookSchemaVersion } from './proseMirror/schema';

// ********************************************************************************
// == Version =====================================================================
// identifies when there is no NotebookVersion yet. It is also the starting value
// for the indexing of the NotebookVersions. The first index is NO_NOTEBOOK_VERSION + 1.
export const NO_NOTEBOOK_VERSION = 0;

// --------------------------------------------------------------------------------
export type NotebookVersionIdentifier = Identifier/*hashed version index*/;
export const generateNotebookVersionIdentifier = (index: number): NotebookVersionIdentifier => hashNumber(index)/*explicitly needs to be string-based hashing for consistency!*/;

export type NotebookVersionContent = NodeContent/*alias*/;

// identifies the User / Session that made the Versions from a given Editor. This
// *must* be universally unique for each Editor (by ProseMirror contract)
export type ClientIdentifier = Identifier;
export const generateClientIdentifier = (user: AuthedUser): ClientIdentifier =>
  user.userId + '|' + user.sessionId;

// --------------------------------------------------------------------------------
// NOTE: document ID is NotebookVersion#index (string-hashed)
// NOTE: because this is written by the client, any fields that are added need to be
//       considered for validation in Firestore Rules
// CHECK: ProseMirror keys off of the clientId which is *not* validated (since
//        Firestore rules do not have the session information). This presents a
//        minor data integrity issue as a User may spoof another User's clientId.
//        As long as all uses of a Version rely only on 'createdBy' (which *is*
//        validated) then this is not a problem.
// SEE: firestore.rules:/notebooks/notebooks-versions
export type NotebookVersion = Creatable & Readonly<{
  /** the {@link NotebookSchemaVersion} of this Checkpoint */
  schemaVersion: NotebookSchemaVersion;

  /** the ProseMirror Step version of this Version. It is effectively a Lamport
   *  Timestamp. It must start at NO_NOTEBOOK_VERSION and increase monotonically */
  index: number;
  /** the universally unique identifier for the 'client' (a combination of the User
   *  and Session identifiers) as required by ProseMirror */
  clientId: ClientIdentifier;
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
