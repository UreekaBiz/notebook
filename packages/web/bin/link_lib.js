const fs = require('fs');
const path = require('path');

// This "script" is provided to deal with the dependency hell that deploying
// using the `firestore` CLI imposes. Specifically, the interaction between
// Lerna local dependencies and `firestore` requires that `package.json`
// specify local dependencies using 'file:'.
//
// This creates the 'lib' directory if it doesn't already exist and links
// the named packages (dependencies) in that directory. It is the bash
// equivalent of:
//
//    mkdir -p lib && ln -sF ../../service-common lib/

// ********************************************************************************
// the path to the 'packages' directory from this project's directory
// NOTE: *NOT* from the location of this script
const relativePackagesDir = '..'/*assumed to be parent dir*/;

// the name of the directory where the local dependencies will be linked to. This
// will match what is found after the 'file:' in the package.json dependencies. Ex:
//        "@ureeka-notebook/service-common": "file:./lib/service-common",
const relativeResultDir = 'lib';

// list the dependent packages (from the 'packages' directory)
const dependencies = [
  'service-common',
  'ssr-service',
  'web-service',
];

// ================================================================================
// establish absolute dirs for sanity
const thisProjectDir = path.resolve(process.cwd());
const packagesDir = path.resolve(thisProjectDir, relativePackagesDir);
const resultDir = path.resolve(thisProjectDir, relativeResultDir);

// create the directory IFF it doesn't already exist
if(!fs.existsSync(resultDir)) {
  console.log(`Creating dir: ${resultDir}`);
  fs.mkdirSync(resultDir);
} /* else -- the result directory already exists */

// symlink each dependency IFF it doesn't already exist
dependencies.forEach(dependency => {
  console.log('Setting up symlink dependency for:' ,dependency);
  const dependencyDir = path.resolve(packagesDir, dependency);
  const dependencyResultPath = path.resolve(resultDir, dependency);
  if(!fs.existsSync(dependencyResultPath)) { /*dependency doesn't exist*/
    console.log(`Link: ${dependencyDir} => ${dependencyResultPath}`);
    fs.symlinkSync(dependencyDir, dependencyResultPath, 'dir');

    console.log('✅ ', dependency, 'symlink dependency created.\n');
  } else { /*dependency link already exists*/
    // validate if is a symlink folder
    const dependencyPathStats = fs.lstatSync(dependencyResultPath);
    // FIXME: Firebase is throwing these errors when deploying Cloud Functions but
    //        this shouldn't run at that time! Temporarily logging instead of throwing
    if(!dependencyPathStats.isSymbolicLink()) console.error('This directory is not a symlink folder. Remove manually and run `npm run bootstrap` again.');

    // validate that in current folder tree
    const parentTree = fs.realpathSync(dependencyResultPath).replace(dependency, ''/*remove*/);
    const isSameParentTree = dependencyResultPath.includes(parentTree);
    // FIXME: Firebase is throwing these errors when deploying Cloud Functions but
    //        this shouldn't run at that time! Temporarily logging instead of throwing
    if(!isSameParentTree) console.error('The symlink folder does not live in this local repository. Remove manually and run `npm run bootstrap` again.');

    console.log('✅ ', dependency, 'symlink dependency configured correctly.\n');
  }
});
