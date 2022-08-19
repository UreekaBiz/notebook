import { Creatable, ObjectTuple, Updatable } from '../util/datastore';
import { Identifier } from '../util/type';

// ********************************************************************************
// NOTE: Asset documentIds are raw Firestore (random) Document Ids (regardless of type)
export type AssetIdentifier = Identifier;

// --------------------------------------------------------------------------------
// Assets don't have to be unique so this simply removes leading / trailing whitespace
// as well as any duplicate whitespace
export const normalizeAsset = (name: string) =>
  name.trim().replace(/\s+/g, ' ');

// == Label (Firestore) ===========================================================
/** the broad class of asset */
export enum AssetType {
  // NOTE: SWAG -- only Image is currently used
  Audio = 'audio',
  Image = 'image',
  Video = 'video',
}

// --------------------------------------------------------------------------------
// Assets are mastered in GCS using a userId-documentId naming convention
// NOTE: Assets are *hard* deleted (along with the actual asset)
export type Asset = Creatable & Updatable & Readonly<{ /*Firestore*/
  /** the type of Asset */
  type: AssetType/*write-on-create server-written*/;
  /** the size of the Asset in bytes */
  sizeInBytes: number/*write-on-create server-written*/;

  /** the URL to fetch or display the Asset */
  url: string/*write-on-create server-written*/;

  /** optional (user-friendly) name of the Asset */
  name?: string/*write-many server-written*/;
  /** optional description of the Asset */
  description?: string/*write-many server-written*/;

  /** in order to support fast prefix (typeahead find) searches, at most
   *  #MAX_PREFIX_COUNT normalized prefixes of the Asset's name (if it has one) */
  searchNamePrefixes?: string[]/*write-many server-written*/;
  /** normalized name expressly for sorting
   *  @see #labelComparator */
  sortName?: string/*write-many server-written*/;
}>;
export type AssetTuple = ObjectTuple<AssetIdentifier, Asset>;

// == Asset User-Summary (RTDB) ===================================================
// SEE: ./datastore.ts: ASSET_USER_SUMMARY
export type AssetUserSummary = Readonly<{ /*RTDB only*/
  /** the number of Assets associated with the User. This value may be temporarily
   *  negative due to out-of-order data. The UI must always clip this value at 0
   *  when displaying it. */
  count: number/*atomic-increment*/;
  /** the total number bytes in stored Assets for the User. This value may be
   *  temporarily negative due to out-of-order data. The UI must always clip this
   *  value at 0 when displaying it. */
  byteCount: number/*atomic-increment*/;
}>;
