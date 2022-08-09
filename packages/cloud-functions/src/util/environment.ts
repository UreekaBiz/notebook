import { logger } from 'firebase-functions';

import { EnvironmentType } from '@ureeka-notebook/service-common';

// NOTE: do *not* import from '../logging/Logger' as it will create a circular
//       dependency. This should be dependency free and use local-imports.

// NOTE: this file is intentionally (locally) dependency free so that it can be
//       loaded at the top level without worrying about creating loops, etc.

// convenience wrapper around `process.env` that ensures that all required
// variables are present for the specified environment
// ********************************************************************************
// To build and run individually:
// $ ./node_modules/typescript/bin/tsc --outDir dist src/util/environment.ts
// $ npx env-cmd -f .env node dist/environment.js
// ********************************************************************************

// NOTE: ENVIRONMENT = 'development' is assumed unless explicitly set
// NOTE: make sure that the top-level '/bin/dump_env.js' matches!

export const ENVIRONMENT: EnvironmentType = (() => {
  const environment = process.env['ENVIRONMENT'];
  if(environment === 'production') return 'production';
  else if(environment === 'staging') return 'staging';
  else if(environment === 'monkeytest') return 'monkeytest';
  else if(environment !== 'development') logger.error('devel/config', `Unknown value for 'ENVIRONMENT': ${environment}`);
  return 'development'/*default for sanity*/;
})();

// ................................................................................
// REF: '/bin/dump_env.js'
export const PROJECT_ID = process.env['NEXT_PUBLIC_FIREBASE_PROJECT_ID']!;
export const FUNCTION_REGION = process.env['NEXT_PUBLIC_FIREBASE_FUNCTION_REGION']!;

export const SERVICE_ACCOUNT_EMAIL = `${PROJECT_ID}@appspot.gserviceaccount.com`;

// ................................................................................
// NOTE: the values are ANYTHING other than 'undefined' -- it simply makes debugging easier
export const VALUE_NOT_SPECIFIED = 'VALUE_NOT_SPECIFIED'/*sentinel if env variable isn't specified*/;

// ................................................................................
// context vars
// NOTE: represented differently in '/bin/dump_env.js' (be diligent!)
const contextVariables = [
  'BUILD_DATE',
  'GIT_BRANCH',
  'GIT_HASH',
  'VERSION',
];

// ................................................................................
// NOTE: make sure that the top-level '/bin/dump_env.js' matches!
// NOTE: if regexp's are used then the first capture group is the variable name and
//       the remaining group(s) are the (possibly nested) object value. Only a
//       single variable is supported per regex.  The regex must match the entire
//       variable name.
const commonVariables = [
  'NOTEBOOK_CHECKPOINT_N_VERSIONS',
  'NOTEBOOK_VERSION_MAX_ATTEMPTS',
];

// ................................................................................
// NOTE: defined locally to make this file dependency-free
const isBlank = (s: string | null | undefined) => {
  if(!s) return true;
  return (s.trim().length < 1);
};

// ................................................................................
type Tuple = [string, string | Record<string, any>]/*for convenience*/;
type EnvVariable = string | Record<string, any>;

const getKeyValue = (variable: string): Tuple => {
  let value = process.env[variable];
  if(isBlank(value)) {
    logger.error(`No value for .env variable '${variable}'. Unexpected errors will occur at runtime.`);
    value = VALUE_NOT_SPECIFIED;
  } /* else -- the variable has a value as expected */
  return [variable, value!];
};

// a.[b.[c]] = processEnvValue
const assembleObject = (tuple: Tuple, value: Record<string, any>, index: number, captureGroups: string[]) => {
  // NOTE: unfortunately cannot detect duplicate keys here as they're already
  //       clobbered by 'env-cmd' when they're added to the environment
  const property = captureGroups[index];
  if(index === (captureGroups.length - 1)) { /*leaf*/
    value[property] = tuple[1/*value*/];
  } else { /*node -- need to descend*/
    const childValue = (value[property] === undefined) ? {}/*new*/ : value[property]/*existing*/;
    assembleObject(tuple, childValue, index + 1/*descend*/, captureGroups);
    value[property] = childValue;
  }
};

// returns an object for the specified regex
const getMatch = (processEnv: string[], regex: RegExp): Tuple => {
  // the first capture group is the variable name and remaining group(s) are the
  // (possibly nested) object value
  const matches = processEnv.map(variable => regex.exec(variable))
                            .filter(match => match !== null);
  if(matches.length < 1) {
    logger.error(`No match for regex .env variable '${regex.source}'. Unexpected errors will occur at runtime.`);
    return [regex.source, VALUE_NOT_SPECIFIED];
  } /* else -- there are matches */

  // NOTE: by contract only a single key is allowed per regex
  const key = matches[0/*first*/]![1/*1st capture group*/];
  const value = {}/*default empty object*/;
  for(const match of matches) {
    if(match!.length < 2) {
      logger.error(`At least two capture groups are required for regex-based .env variables (${match!.length} < 2). Ignoring (${match![0/*full match*/]}).`);
      continue/*ignoring value*/;
    } /* else -- at least a key and value as expected */
    if(key !== match![1/*1st capture group*/]) {
      logger.error(`Only a single key is supported for regex-based .env variables (${match![1/*1st capture group*/]} !== ${key}). Ignoring (${match![0/*full match*/]}).`);
      continue/*ignoring key*/;
    } /* else -- single key as expected */

    const tuple = getKeyValue(match![0/*full match*/]);
    assembleObject(tuple, value, 2/*start after key*/, match!);
  }
  return [key, value];
};

// ================================================================================
export const isDevelopment = () => ((ENVIRONMENT !== 'production') && (ENVIRONMENT !== 'staging'))/*'monkeytest' implies 'development'*/;

// ................................................................................
// NOTE: gets executed on startup
const environment = (() => {
  const variables: (string | RegExp)[] = [...contextVariables, ...commonVariables];

  const processEnv = [...Object.keys(process.env)]/*for convenience*/;

  return new Map(variables.map(variable => {
    if(variable instanceof RegExp) {
      return getMatch(processEnv, variable);
    } else { /*string*/
      return getKeyValue(variable);
    }
  }));
})()/*execute*/;

// ................................................................................
export const hasEnv = (key: string) => environment.has(key);

export const getEnvObject = (key: string, defaultValue?: EnvVariable): EnvVariable => {
  if(!environment.has(key)) {
    if(defaultValue !== undefined) return defaultValue;
    throw new Error(`Unknown environment variable '${key}'.`);
  } /* else -- the key is known as expected */
  const value = environment.get(key)!;

  return value;
};

export const getEnv = (key: string, defaultValue?: EnvVariable): EnvVariable => {
  return getEnvObject(key, defaultValue);
};
