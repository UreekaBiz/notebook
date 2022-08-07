import { ApplicationError } from './error';

// convenience utilities for accessing `process.env` (simply for sanity)
// ********************************************************************************
export const hasEnv = (key: string) => (process.env[key] !== undefined);

export const getEnv = (key: string, defaultValue?: string): string => {
  if(!hasEnv(key)) {
    if(defaultValue !== undefined) return defaultValue;
    throw new ApplicationError('functions/not-found', `Unknown environment variable '${key}'.`);
  } /* else -- the key exists as expected */
  const value = process.env[key]!;

  return value;
};
export const getEnvNumber = (key: string, defaultValue?: number): number => {
  if(!hasEnv(key)) {
    if(defaultValue !== undefined) return defaultValue;
    throw new ApplicationError('functions/not-found', `Unknown environment variable '${key}'.`);
  } /* else -- the key exists as expected */
  const stringValue = process.env[key]!,
        numberValue = Number(stringValue);
  if(isNaN(numberValue)) throw new ApplicationError('functions/invalid-argument', `Expected number for environment variable '${key}' but got '${stringValue}'.`);

  return numberValue;
};
