import { getEnv, hasEnv } from './environment';

// ********************************************************************************
// the PackageVersion is specified by the top-level 'bin/get_version.js' via the
// env var NEXT_PUBLIC_VERSION (which is set when the build is run)
const NEXT_PUBLIC_VERSION = 'NEXT_PUBLIC_VERSION';

// --------------------------------------------------------------------------------
// NOTE: only the 'packages' structure exists in non-deployed environments
export type PackageVersions = Record<Package, string/*version*/>;
export type PackageVersion = Readonly<{
  // Git Branch and Hash
  branch: string;
  hash: string;

  // build date
  date: string;

  // JSON structure of each of the respective 'package.json' files keyed by the 'name'
  // defined in each 'package.json'
  packages: PackageVersions;
}>;

// ================================================================================
const Unknown = 'unknown'/*arbitrary but obvious*/;
export const UnknownBranch = Unknown;
export const UnknownDate = Unknown;
export const UnknownHash = Unknown;
export const UnknownVersion = Unknown;

export enum Package {
  Application = '@ureeka-notebook/application',
  ServiceCommon = '@ureeka-notebook/service-common',
  SSRService = '@ureeka-notebook/ssr-service',
  Web = '@ureeka-notebook/web',
  WebService = '@ureeka-notebook/web-service',
}

// --------------------------------------------------------------------------------
const defaultPackageVersions = Object.values(Package).reduce((o, key) => ({ ...o, [key]: UnknownVersion }), {} as PackageVersions);

export const getPackageVersion = (): PackageVersion => {
  if(hasEnv(NEXT_PUBLIC_VERSION)) {
    try {
      return JSON.parse(getEnv(NEXT_PUBLIC_VERSION));
    } catch(error) {
      console.warn(`Error parsing package version from ${NEXT_PUBLIC_VERSION}. (A default will be used.) Reason: `, error);
      return {
        branch: UnknownBranch,
        hash: UnknownHash,
        date: UnknownDate,
        packages: defaultPackageVersions,
      };
    }
  } else { /*no version set on build (assumed to be local-dev)*/
    return {
      branch: `${UnknownBranch} (local-dev)`,
      hash: `${UnknownHash} (local-dev)`,
      date: new Date()/*now*/.toISOString(),
      packages: defaultPackageVersions,
    };
  }
};
