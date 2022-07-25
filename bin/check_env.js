const fs = require('fs');
const path = require('path');

// ********************************************************************************
const basedir = path.join(__dirname, '..'/*currently in 'bin'*/);

// ================================================================================
function err(message, ...opt) {
  console.error(`ERROR: ${message}${opt.join('')}\n`);
  process.exit(1);
}

// ********************************************************************************
// ensure that NEXT_PUBLIC_FIREBASE_PROJECT_ID is always set
const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
if(!projectId) err(`NEXT_PUBLIC_FIREBASE_PROJECT_ID not found. Was 'env-cmd' run?`);

// ================================================================================
// ensure that the project_id in @cloud-functions:/firebase-admin.json
// matches that of NEXT_PUBLIC_FIREBASE_PROJECT_ID to ensure that the wrong environment
// is never accidentally updated!
const argv = process.argv;
if(argv.includes('--firebase-admin')) {
  const filename = path.join(basedir, 'packages', 'cloud-functions', 'firebase-admin.json');
  if(!fs.existsSync(filename)) err(`${filename} doesn't exist`);

  let package;
  try {
    const contents = fs.readFileSync(filename, 'utf8');
    package = JSON.parse(contents);
  } catch(error) {
    err(`Failed to parse: `, filename);
  }
  if(!package || !package.project_id) err(`firebase-admin.json must contain 'project_id'`);
  if(package.project_id !== projectId) err(`'project_id' in firebase-admin.json doesn't match: '${package.project_id}' vs '${projectId}'`);

  if(!argv.includes('--force')) {
    console.log(`***********************************`);
    console.log(`MANIPULATING DATA FOR: ${projectId}`);
    console.log(`press Ctrl+C until it's too late`);
    (async () => {
      await new Promise(resolve => setTimeout(resolve, 5000/*long enough for someone to read*/));
    })();
  }
}