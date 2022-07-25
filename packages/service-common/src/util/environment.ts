import { createApplicationError } from './error';

// convenience types, etc. for accessing variables that are present in the environment
// ********************************************************************************
// ================================================================================
// NOTE: in increasing order of 'severity'
export type EnvironmentType =
  | 'monkeytest'
  | 'development'
  | 'staging'
  | 'production';

// --------------------------------------------------------------------------------
export const isLocalDevelopment = () => {
  // NOTE: a bit hack'ish but given that the environments are fixed, it should suffice
  const projectId = process.env['NEXT_PUBLIC_FIREBASE_PROJECT_ID']!;
  return !((projectId === 'notebook-dev-35453') ||
           (projectId === 'notebook-stage-35453') ||
           (projectId === 'notebook-prod-35453'));
};

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
