import { ApplicationError } from './error';

// convenience utilities for accessing `process.env` (simply for sanity)
// ********************************************************************************
// attempt to reduce the number of accidental typos
// NOTE: this must exactly match the client section of the root `.env.template` file
type Environment =
  // explicitly set / exported into the environment on build
  | 'NEXT_PUBLIC_VERSION'

  // from `.env.template`
  | 'NEXT_PUBLIC_ENVIRONMENT'
  | 'NEXT_PUBLIC_LOG_LEVEL'
  | 'NEXT_PUBLIC_FIREBASE_API_KEY'
  | 'NEXT_PUBLIC_FIREBASE_APP_ID'
  | 'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN'
  | 'NEXT_PUBLIC_FIREBASE_DATABASE_URL'
  | 'NEXT_PUBLIC_FIREBASE_FUNCTION_REGION'
  | 'NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID'
  | 'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID'
  | 'NEXT_PUBLIC_FIREBASE_PROJECT_ID'
  | 'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET'
  | 'NEXT_PUBLIC_APPLICATION_URL'
  | 'NEXT_PUBLIC_NOTEBOOK_VERSION_BATCH_SIZE'
  | 'NEXT_PUBLIC_SESSION_UPDATE_INTERVAL'
  | 'NEXT_PUBLIC_ACTIVITY_IDLE_TIMEOUT'
  ;

// --------------------------------------------------------------------------------
export const hasEnv = (key: string) => (process.env[key] !== undefined);

export const getEnv = (key: Environment, defaultValue?: string): string => {
  if(!hasEnv(key)) {
    if(defaultValue !== undefined) return defaultValue;
    throw new ApplicationError('functions/not-found', `Unknown environment variable '${key}'.`);
  } /* else -- the key exists as expected */
  const value = process.env[key]!;

  return value;
};
export const getEnvNumber = (key: Environment, defaultValue?: number): number => {
  if(!hasEnv(key)) {
    if(defaultValue !== undefined) return defaultValue;
    throw new ApplicationError('functions/not-found', `Unknown environment variable '${key}'.`);
  } /* else -- the key exists as expected */
  const stringValue = process.env[key]!,
        numberValue = Number(stringValue);
  if(isNaN(numberValue)) throw new ApplicationError('functions/invalid-argument', `Expected number for environment variable '${key}' but got '${stringValue}'.`);

  return numberValue;
};
