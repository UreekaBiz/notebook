const childProcess = require('child_process');
const fs = require('fs');
const path = require('path');

// This "script" is provided to export a known set of environment variables
// (specified below) into an '.env' file for use in deployment.
//
// An additional set of 'context' variables are provided that include such things
// as the Git branch and hash and the package version.
//
// NOTE: this *MUST* be run from the project root directory *NOT* packages/cloud-functions

// ********************************************************************************
// context vars
const BUILD_DATE = 'BUILD_DATE';
const VERSION = 'VERSION';
const GIT_BRANCH = 'GIT_BRANCH';
const GIT_HASH = 'GIT_HASH';

// --------------------------------------------------------------------------------
// NOTE: all exceptions bubble out by design
const context = () => {
  const basedir = path.join(__dirname, '..'/*currently in 'bin'*/);
  const packageFilename = path.join(basedir, 'package.json');
  const packageContent = fs.readFileSync(packageFilename);
  const packageJson = JSON.parse(packageContent);
  const version = packageJson.version;

  const gitBranch = String(childProcess.execSync('git rev-parse --abbrev-ref HEAD')).replace('\n', '');
  const gitHash = String(childProcess.execSync('git rev-parse HEAD')).replace('\n', '');

  return {
    buildDate: new Date().toISOString(),
    version,
    gitBranch,
    gitHash,
  };
};

// ********************************************************************************
// NOTE:  all of these vars *must* be defined in the Monorepo's top-level '.env'
//        file. Refer to that file for more information.
// NOTE:  ensure that src/util/environment.ts matches!

const VALUE_NOT_SPECIFIED = 'VALUE_NOT_SPECIFIED'/*sentinel if env variable isn't specified*/;
                            /*ANYTHING other than 'undefined' -- it simply makes debugging easier*/

// ................................................................................
// NOTE: in order to support 'ENVIRONMENT' across all tiers, it's set to
//       'NEXT_PUBLIC_ENVIRONMENT' in the .env. This clones it so that there are no
//       'NEXT_PUBLIC_*' variables on the server (for sanity).
process.env['ENVIRONMENT'] = process.env['NEXT_PUBLIC_ENVIRONMENT']/*clone*/;
const ENVIRONMENT = (() => {
  const environment = process.env['ENVIRONMENT'];
  if(environment === 'production') return 'production';
  else if(environment === 'staging') return 'staging';
  else if(environment === 'monkeytest') return 'monkeytest';
  else if(environment !== 'development') console.error(`Unknown value for 'ENVIRONMENT': ${environment}`);
  return 'development'/*default for sanity*/;
})();

// ................................................................................
// NOTE: this was introduced to further differentiate the environments in cases
//       where 'ENVIRONMENT' is too coarse
// SEE: @web-service: /util/environment.ts
const isLocalDevelopment = () => !isBlank(process.env['FIREBASE_PRIVATE_KEY']);

// ................................................................................
// NOTE:  ensure that src/util/environment.ts matches!
// NOTE: if regexp's are used then the first capture group is the variable name and
//       the remaining group(s) are the (possibly nested) object value. Only a
//       single variable is supported per regex.  The regex must match the entire
//       variable name.
const commonVariables = [
  'ENVIRONMENT',

  // NOTE: these two vars ('FUNCTION_REGION' and 'GCP_PROJECT') were removed in Node
  //       v10. Unfortunately, they cannot be renamed to remove 'NEXT_PUBLIC_FIREBASE_'
  //       since (annoyingly!) Firestore Cloud Function deployment precludes them
  //       from being in the .env of a Cloud Function
  //       (e.g. "Error Key FUNCTION_REGION is reserved for internal use." is seen)
  // SEE: cloud-functions/util/environment.ts for how these are used
  // SEE: https://cloud.google.com/functions/docs/env-var#nodejs_10_and_subsequent_runtimes
  'NEXT_PUBLIC_FIREBASE_FUNCTION_REGION',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  // NOTE: this follows the same pattern as above for sanity (but is not required to)
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',

  'NOTEBOOK_CHECKPOINT_N_VERSIONS',
  'NOTEBOOK_UPDATE_DOCUMENT_MAX_ATTEMPTS',

  'NEXT_PUBLIC_SESSION_UPDATE_INTERVAL',
  'SESSION_EXPIRATION_EPSILON',
];
const developmentVariables = [/*no additional*/];
const stagingVariables = [
  'BIGQUERY_IMPORT_DATASET',

  'FIRESTORE_EXPORT_BUCKET',
  'FIRESTORE_EXPORT_COLLECTIONS',
];
const productionVariables = [/*no additional*/];

// NOTE: defined locally to make this file dependency free
const isBlank = (s) => {
  if(!s) return true;
  return (s.trim().length < 1);
};

const environment = (() => {
  // pull the defined variables from the env
  let variables;
  if(!isLocalDevelopment()) {
    if(ENVIRONMENT === 'production') variables = [...commonVariables, ...stagingVariables, ...productionVariables];
    else if(ENVIRONMENT === 'staging') variables = [...commonVariables, ...stagingVariables];
    else variables = [...commonVariables, ...stagingVariables, ...developmentVariables]/*non-local devel is at least 'staging'*/;
  } else variables = [...commonVariables, ...developmentVariables]/*'monkeytest' implies 'development'*/;

  // pull the value(s) of each variable from the environment
  // NOTE: variables are either string or RegExp
  const env = new Map/*<string,string>*/();
  const processEnv = [...Object.keys(process.env)]/*for convenience*/;
  const addVariable = (variable) => {
    let value = process.env[variable];
    if(isBlank(value)) {
      console.error(`No value for .env variable '${variable}'. Unexpected errors will occur at runtime.`);
      value = VALUE_NOT_SPECIFIED;
    } /* else -- the variable has a value as expected */
    env.set(variable, value);
    return [variable, value];
  };
  const addMatches = (regex/*RegExp*/) => {
    const matches = processEnv.filter(variable => !!variable.match(regex))
                              .map(variable => addVariable(variable));
    if(matches.length < 1) console.error(`No match for regex .env variable '${regex.source}'. Unexpected errors will occur at runtime.`);
  };
  variables.forEach(variable => {
    if(variable instanceof RegExp) {
      addMatches(variable);
    } else { /*string*/
      addVariable(variable);
    }
  });

  // incorporate the context
  const { buildDate, version, gitBranch, gitHash } = context();
  env.set(BUILD_DATE, buildDate);
  env.set(VERSION, version);
  env.set(GIT_BRANCH, gitBranch);
  env.set(GIT_HASH, gitHash);

  return env;
})();

// ================================================================================
let result = '';
environment.forEach((value, key) => {
  if(!value) throw new Error(key + ' not defined in the environment. Aborting.');
  result += `${key}=${value}\n`;
});

fs.writeFileSync(path.join(__dirname, '/../.env'), result);
