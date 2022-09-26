import { Updatable } from '../util/datastore';
import { Timestamp } from '../util/firestore';
import { SystemUserId } from '../util/type';

// ********************************************************************************
// NOTE: the version identifier is simply a random Document Id and has no intentional meaning

// == Version (Firestore) =========================================================
// NOTE: each change to this structure is an *insert* into the Version collection
//       (i.e. the Version collection is a log of changes to the Version structure)
// NOTE: this is world-readable so it cannot contain any sensitive information
export type Version = Updatable & Readonly<{
  // NOTE: nested to allow for future expansion
  web?: WebVersion;
}>;

export const defaultVersion: Version = {
  /*no defaults*/

  // perfunctory (always overwritten so values are irrelevant)
  updateTimestamp: null/*see above*/ as unknown as Timestamp,
  lastUpdatedBy: SystemUserId,
};

// ................................................................................
// NOTE: there's no obvious way to correlate a deployed UI's build date (to any
//       degree of precision) with this structure due to the fact that there are
//       multiple steps to deploy. This means that currently there is ambiguity
//       in that the same commit *may* be deployed more than once. (Theoretically,
//       this should produce the same code and therefore there are no differences
//       but in reality there are always the chance for differences (e.g. env)).
export type WebVersion = Readonly<{
  /**Git branch name*/
  branch: string;
  /**Git commit hash*/
  hash: string;

  // CHECK: include the `web` package version?
  // SEE: PackageVersion
}>;
