import { UploadTaskSnapshot } from 'firebase/storage';
import { lastValueFrom, Observable } from 'rxjs';

import { Asset, AssetIdentifier, AssetTuple, ObjectTuple } from '@ureeka-notebook/service-common';

import { getLogger, ServiceLogger } from '../logging';
import { ApplicationError } from '../util/error';
import { Pagination } from '../util/pagination';
import { paginatedQuery } from '../util/observablePaginatedCollection';
import { getUserId } from '../util/user';
import { assetQuery } from './datastore';
import { assetDelete, assetUpdate } from './function';
import { assetById$, assetOnceById$, assetSnapshotObservable$ } from './observable';
import { Asset_Update, AssetFilter } from './type';
import { assetUpload$ } from './util';

const log = getLogger(ServiceLogger.ASSET);

// ********************************************************************************
export class AssetService {
  protected static readonly DEFAULT_PAGE_SIZE = 24/*guess*/;

  // == Singleton =================================================================
  private static singleton: AssetService;
  public static create() { return (AssetService.singleton = new AssetService()); }
  public static getInstance() { return AssetService.singleton; }

  // == Lifecycle =================================================================
  protected constructor() {/*nothing at this time*/}
  public shutdown() {
    log.info(`Shutting down Asset service ...`);
  }

  // == Observables ===============================================================
  // -- Asset ---------------------------------------------------------------------
  /**
   * @param filter the fields that are optionally filtered and sorted on
   * @param pageSize the number of Assets returned per page
   * @returns {@link Pagination} over the collection of {@link Assets}
   * @throws {@link ApplicationError}
   * - `permission-denied` if the caller is not logged in
   */
  public onAssets(filter: AssetFilter, pageSize: number = AssetService.DEFAULT_PAGE_SIZE): Pagination<AssetTuple> {
    // NOTE: Assets are currently specific to the User that is logged in
    const userId = getUserId();
    if(!userId) throw new ApplicationError('functions/permission-denied', 'Cannot access Assets while logged out.');

    return paginatedQuery(assetQuery(userId, filter), assetSnapshotObservable$, pageSize,
                          `Filtered Assets (${userId};${JSON.stringify(filter)})`);
  }

  /**
   * @param assetId the {@link AssetIdentifier} of the desired {@link Asset}
   * @returns Observable over {@link Asset} with the specified identifier. If
   *          no such Asset exists then `null` is returned.
   */
  public onAsset$(assetId: AssetIdentifier): Observable<ObjectTuple<AssetIdentifier, Asset | null/*not found*/>> {
    return assetById$(assetId);
  }

  // -- Asset User-Summary --------------------------------------------------------
  // TODO!!!

  // == Read ======================================================================
  // -- Asset ---------------------------------------------------------------------
  /**
   * @param assetId the {@link AssetIdentifier} for the desired {@link Asset}
   *  @returns the {@link Asset} for the specified {@link AssetIdentifier}
   *  @throws {@link ApplicationError}
   *  - `permission-denied` if the calling User does not have access to the
   *    specified identified {@link Asset}
   *  - `not-found` if the specified {@link AssetIdentifier} does not represent
   *    known {@link Asset}
   */
  public async getAsset(assetId: AssetIdentifier): Promise<Asset> {
    const asset = await lastValueFrom(assetOnceById$(assetId));
    if(asset === null/*not-found*/) throw new ApplicationError('functions/not-found', `Could not find Asset for Asset Id (${assetId}).`);
    return asset;
  }

  // -- Asset User-Summary --------------------------------------------------------
  // TODO!!!

  // == Create / Upload ===========================================================
  /**
   * @param data the data (bytes, {@link File}, etc) that contains the asset to upload
   * @return an Observable over the {@link UploadTaskSnapshot} for the upload. When
   *         complete the {@link UploadTaskSnapshot} can be used to retrieve the
   *         resulting download URL (`uploadTask.snapshot.ref.getDownloadURL()`).
   *         An {@link Asset} is created asynchronously once the asset has been
   *         uploaded.
   */
  public upload$(data: Blob | Uint8Array | ArrayBuffer): Observable<UploadTaskSnapshot> {
    // NOTE: Assets are currently specific to the User that is logged in
    const userId = getUserId();
    if(!userId) throw new ApplicationError('functions/permission-denied', 'Cannot upload Assets while logged out.');

    return assetUpload$(userId, data);
  }

  // == Update / Delete ===========================================================
  /**
   * @param update the Asset that is to be updated. The specified update is *merged*
   *        with the current data. Fields that are specified in the update are
   *        overwritten with the specified value. If that value is `null` or `undefined`
   *        then that field is removed. Any fields that are not specified (as
   *        allowed by the Schema) in the update remain unchanged.
   * @throws a {@link ApplicationError}:
   * - `permission-denied` if the caller is not logged in or is not the creator of
   *   the {@link Asset}
   * - `not-found` if the {@link AssetIdentifier} does not represent a known {@link Asset}
   * - `invalid-argument` if the specified name or description is longer than the
   *   allowed length
   * - `datastore/write` if there was an error updating the {@link Asset}
   */
  public async updateAsset(update: Asset_Update) {
    await assetUpdate(update);
  }

  /**
   * @param assetId the {@link AssetIdentifier} of the {@link Asset} that is
   *         to be deleted
   * @throws a {@link ApplicationError}:
   * - `permission-denied` if the caller is not logged in or is not the creator of
   *   the {@link Asset}
   * - `not-found` if the {@link AssetIdentifier} does not represent a known {@link Asset}
   * - `datastore/write` if there was an error setting the deleted flag on the {@link Asset}
   */
  public async deleteAsset(assetId: AssetIdentifier) {
    await assetDelete({ assetId });
  }
}
