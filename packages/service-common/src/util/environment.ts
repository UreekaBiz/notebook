import { createApplicationError } from './error';
import { isBlank } from './string';

// convenience types, etc. for accessing variables that are present in the environment
// ********************************************************************************
// ================================================================================
// NOTE: in increasing order of 'severity'
export type EnvironmentType =
  | 'monkeytest'
  | 'development'
  | 'staging'
  | 'production';

// == Local Development ===========================================================
// the presence of FIREBASE_PRIVATE_KEY determines if the development is local
// TODO: this is close but should likely be updated to work for all packages. This
//       approach assumes only server-side (since no 'NEXT_PUBLIC_' prefix)
// TODO: this isn't 100% correct either. For development environments it is likely
//       that both local-dev and deployed modes will be used therefore
//       'FIREBASE_PRIVATE_KEY' will be present and make the deployed environment
//       think that it's local-dev. This isn't specifically a problem per se. It's
//       just not consistent / accurate.
export const isLocalDevelopment = () => !isBlank(process.env['FIREBASE_PRIVATE_KEY']);

// == Client vs Server ============================================================
// a hacky way to check if the execution is being made on the server or client side.
// @ts-ignore
export const isClientSide = () => typeof document !== 'undefined'/*document is only defined on client-side*/;
export const isServerSide = () => !isClientSide()/*by definition*/;

// TODO: Write comments
export const wrapClientSideOnlyFunction = <T extends (...params: any) => any>(func: T, label: string): T => {
  const caller = ((...params) => {
    if(isServerSide()) throw createApplicationError('devel/config', `Calling '${label}' on the Server Side. This function is meant to run only on Client Side.`);
    return func(...params);
  }) as T;

  return caller;
};
