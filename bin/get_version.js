const fs = require('fs');
const path = require('path');
const childProcess = require('child_process');

// ********************************************************************************
const basedir = path.join(__dirname, '..'/*currently in 'bin'*/);

// ================================================================================
function err(message, ...opt) {
  console.error(`ERROR: ${message}${opt.join('')}\n`);
  process.exit(1);
}

// ********************************************************************************
const packageVersions = {};
function addVersionFile(fileName) {
  try {
    const content = fs.readFileSync(path.join(basedir, fileName));
    const json = JSON.parse(content);
    packageVersions[json.name] = json.version;
  } catch(error) {
    err('Failed to parse: ', fileName);
  }
}

// ================================================================================
// .. package.json ................................................................
addVersionFile('package.json');
const packages = fs.readdirSync(path.join(basedir, 'packages'));
packages.forEach(package => addVersionFile(path.join('packages', package, 'package.json')));

// .. Git .........................................................................
let hash = 'parsing failed';
let branch = 'parsing failed';
try {
  hash = String(childProcess.execSync('git rev-parse HEAD')).replace('\n', '');
} catch(error) { /*do nothing; error will use default*/ }
try {
  branch = String(childProcess.execSync('git rev-parse --abbrev-ref HEAD')).replace('\n', '');
} catch(error) { /*do nothing; error will use default*/ }

// .. Output ......................................................................
// SEE: PackageVersion in @web-service: util/version.ts
console.log(JSON.stringify({
  date: new Date().toISOString()/*now*/,
  hash,
  branch,
  packages: packageVersions,
}));