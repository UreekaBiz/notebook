import { VersionWrite_Rest, VersionWrite_Rest_Schema } from '@ureeka-notebook/service-common';

// ** Service-Common **************************************************************
export {
  // SEE: @ureeka-notebook/service-common: version/type.ts
  Version,
  WebVersion,
} from '@ureeka-notebook/service-common';

// ** Admin-Only ******************************************************************
// == Version =====================================================================
// -- CUD -------------------------------------------------------------------------
export const Version_Write_Schema = VersionWrite_Rest_Schema;
export type Version_Write = VersionWrite_Rest;
