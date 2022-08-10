import * as Validate from 'yup';

import { createApplicationError } from './error';
import { generateShortUuid } from './uuid';

// common / shared types
// ********************************************************************************

// == Convenience =================================================================
// type-safe alternate to 'XXX as YYY'
export const isType = <T>(t: T) => t;

// use to assert that a `switch` is exhaustive
// SEE://www.typescriptlang.org/docs/handbook/advanced-types.html#exhaustiveness-checking
export const assertNever = (x: never, message = `Invalid argument, expected never but received ${x}`): never => {
  throw createApplicationError('config/invalid-argument', message);
};

// == TypeScript ==================================================================
/** Partial Record */
export type PartialRecord<K extends keyof any, T> = {
  [P in K]?: T;
};

/** redefine a type of a member */
export type Modify<T, R> = Omit<T, keyof R> & R;

/** override a 'readonly' type */
export type Mutable<T extends object> = { -readonly [K in keyof T]: T[K]; };
export const mutable = <T>(t: T): { -readonly [K in keyof T]: T[K] } => t;

// --------------------------------------------------------------------------------
// REF: https://stackoverflow.com/questions/55012174/why-doesnt-object-keys-return-a-keyof-type-in-typescript
export const keysOf = <T extends Object>(o: T): Array<keyof T> => Array.from(Object.keys(o)) as any;

// == Identifiers =================================================================
export type Identifier = string/*alias*/;
export const Identifier_Schema =
  Validate.string()
        .matches(/^(?!\s|.*\s$)\S+$/)/*don't allow padding for sanity*/
        .required();

export const SystemUserId: Identifier = 'SystemUser'/*not guaranteed to be unique within all id-spaces but highly unlikely*/;
