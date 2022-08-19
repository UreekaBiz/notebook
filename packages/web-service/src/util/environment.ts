import { ApplicationError } from './error';

// convenience utilities for accessing `process.env` (simply for sanity)
// ********************************************************************************
// attempt to reduce the number of accidental typos
// NOTE: this must exactly match the client section of the root `.env.template` file
type Environment =
  // explicitly set / exported into the environment on build
  | 'NEXT_PUBLIC_VERSION'

  // from `.env.template`
  | 'NEXT_PUBLIC_ACTIVITY_IDLE_TIMEOUT'
  | 'NEXT_PUBLIC_APPLICATION_URL'
  | 'NEXT_PUBLIC_ASSET_CACHE_CONTROL'
  | 'NEXT_PUBLIC_ENVIRONMENT'
  | 'NEXT_PUBLIC_FIREBASE_API_KEY'
  | 'NEXT_PUBLIC_FIREBASE_APP_ID'
  | 'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN'
  | 'NEXT_PUBLIC_FIREBASE_DATABASE_URL'
  | 'NEXT_PUBLIC_FIREBASE_FUNCTION_REGION'
  | 'NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID'
  | 'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID'
  | 'NEXT_PUBLIC_FIREBASE_PROJECT_ID'
  | 'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET'
  | 'NEXT_PUBLIC_LOG_LEVEL'
  | 'NEXT_PUBLIC_LOGIN_SHOW_BUTTON'
  | 'NEXT_PUBLIC_NOTEBOOK_VERSION_BATCH_SIZE'
  | 'NEXT_PUBLIC_SESSION_UPDATE_INTERVAL'
  ;

// NOTE: NextJS *only* includes environment variables that are *explicitly* stated
//       in the code as `process.env.XXX`. One *CANNOT* use `process.env['XXX']`.
//       As a result, this map exists.
// REF: https://nextjs.org/docs/basic-features/environment-variables
const environment: Readonly<Record<Environment, string | undefined/*not provided*/>> = {
  // explicitly set / exported into the environment on build
  'NEXT_PUBLIC_VERSION': process.env.NEXT_PUBLIC_VERSION,

  // from `.env.template`
  'NEXT_PUBLIC_ACTIVITY_IDLE_TIMEOUT': process.env.NEXT_PUBLIC_ACTIVITY_IDLE_TIMEOUT,
  'NEXT_PUBLIC_APPLICATION_URL': process.env.NEXT_PUBLIC_APPLICATION_URL,
  'NEXT_PUBLIC_ASSET_CACHE_CONTROL': process.env.NEXT_PUBLIC_ASSET_CACHE_CONTROL,
  'NEXT_PUBLIC_ENVIRONMENT': process.env.NEXT_PUBLIC_ENVIRONMENT,
  'NEXT_PUBLIC_FIREBASE_API_KEY': process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  'NEXT_PUBLIC_FIREBASE_APP_ID': process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN': process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  'NEXT_PUBLIC_FIREBASE_DATABASE_URL': process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  'NEXT_PUBLIC_FIREBASE_FUNCTION_REGION': process.env.NEXT_PUBLIC_FIREBASE_FUNCTION_REGION,
  'NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID': process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID': process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID': process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET': process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  'NEXT_PUBLIC_LOG_LEVEL': process.env.NEXT_PUBLIC_LOG_LEVEL,
  'NEXT_PUBLIC_LOGIN_SHOW_BUTTON': process.env.NEXT_PUBLIC_LOGIN_SHOW_BUTTON,
  'NEXT_PUBLIC_NOTEBOOK_VERSION_BATCH_SIZE': process.env.NEXT_PUBLIC_NOTEBOOK_VERSION_BATCH_SIZE,
  'NEXT_PUBLIC_SESSION_UPDATE_INTERVAL': process.env.NEXT_PUBLIC_SESSION_UPDATE_INTERVAL,
} as const;

// ================================================================================
// CHECK: should this allow for any key or is this constrained version best?
export const hasEnv = (key: Environment) => (environment[key] !== undefined);

// ................................................................................
const convertEnv = <T>(key: Environment, defaultValue: T | undefined/*not specified*/, convert: (value: string) => T): T => {
  if(!hasEnv(key)) {
    if(defaultValue !== undefined) return defaultValue;
    throw new ApplicationError('functions/not-found', `Unknown environment variable '${key}'.`);
  } /* else -- the key exists as expected */
  return convert(environment[key]!);
};

export const getEnv = (key: Environment, defaultValue?: string): string =>
  convertEnv(key, defaultValue, (value) => value);
export const getEnvNumber = (key: Environment, defaultValue?: number): number =>
  convertEnv(key, defaultValue, (value) => {
    const numberValue = Number(value);
    if(isNaN(numberValue)) throw new ApplicationError('functions/invalid-argument', `Expected number for environment variable '${key}' but got '${value}'.`);
    return numberValue;
  });
export const getEnvBoolean = (key: Environment, defaultValue?: boolean): boolean =>
  convertEnv(key, defaultValue, (value) => (value.toLowerCase() === 'true'));
