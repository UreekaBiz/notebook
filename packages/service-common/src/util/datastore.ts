import { FirestoreTimestamp, Timestamp } from './firestore';
import { Modify } from './type';
import { UserIdentifier } from './user';

// common datastore types
// ********************************************************************************
/** 'not-found' is defined to be `null` with respect to {@link ObjectTuple}s */
export type OptionalNotFound<T> =
  T extends null ? null : T;

// ================================================================================
export type ObjectTuple<I, T> = {
  readonly id: I;
  readonly obj: T;
};
export const objectTuple = <I, T extends object | null>(id: I, obj: T): ObjectTuple<I, OptionalNotFound<T>> =>
  ({ id, obj: (obj === null) ? null : obj as any/*REF: https://github.com/microsoft/TypeScript/issues/24929*/ });

// == Persistence Convenience Types ===============================================
export interface Creatable {
  readonly createTimestamp: Timestamp/*write-on-create server-side*/;
  readonly createdBy: UserIdentifier/*write-on-create*/;
}

export interface Updatable {
  // NOTE: by contract 'updateTimestamp' is always written on update to facilitate
  //       on-write/on-update triggers
  readonly updateTimestamp: Timestamp/*write-on-every-edit server-side*/;
  readonly lastUpdatedBy: UserIdentifier/*write-on-create-or-edit*/;
}

// ................................................................................
export type Updatable_Update<T extends Updatable> =
    Pick<T, 'lastUpdatedBy'>/*required*/
  & Modify<Pick<T, 'updateTimestamp'>, {
      readonly updateTimestamp: FirestoreTimestamp/*write-on-edit server-side*/;
    }>;
