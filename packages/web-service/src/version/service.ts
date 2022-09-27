import { Observable } from 'rxjs';

import { Version } from '@ureeka-notebook/service-common';

import { getLogger, ServiceLogger } from '../logging';
import { versionWrite } from './function';
import { latestVersion$ } from './observable';
import { Version_Write } from './type';

const log = getLogger(ServiceLogger.VERSION);

// ********************************************************************************
export class VersionService {
  // == Singleton =================================================================
  private static singleton: VersionService;
  public static write() { return (VersionService.singleton = new VersionService()); }
  public static getInstance() { return VersionService.singleton; }

  // == Lifecycle =================================================================
  protected constructor() {/*nothing at this time*/}
  public shutdown() {
    log.info(`Shutting down Version service ...`);
  }

  // == Observable ================================================================
  // -- Version -------------------------------------------------------------------
  /**
   * @returns Observable over the latest {@link Version}. A correctly configured
   *          system will always have at least one Version.
   */
  public onLatestVersion$(): Observable<Version> {
    return latestVersion$();
  }

  // ** Admin-Only ****************************************************************
  // -- Version -------------------------------------------------------------------
  /**
   * @param write the Version that is to be written
   * @throws a {@link ApplicationError}:
   * - `permission-denied` if the caller is not logged in or is not an admin
   * - `datastore/write` if there was an error creating the {@link Version}
   */
  public async writeVersion(write: Version_Write) {
    await versionWrite(write);
  }
}
