import * as Validate from 'yup';

import { stringMedSchema } from '../util/schema';
import { Modify } from '../util/type';

// ********************************************************************************
// == Version =====================================================================
// .. WebVersion ..................................................................
export const WebVersionWrite_Rest_Schema = Validate.object({
  branch: stringMedSchema
      .min(1/*cannot be blank*/)
      .required(),
  hash: stringMedSchema
      .min(1/*cannot be blank*/)
      .required(),
}).noUnknown();
export type WebVersionWrite_Rest = Validate.InferType<typeof WebVersionWrite_Rest_Schema>;

// .. Version .....................................................................
// NOTE: values that are not specified (i.e. not present) are copied from the
//       previous version. Values that are specified bu defined (which comes across
//       REST as null) are cleared.
// NOTE: if there is no previous version then the values are set to their defaults
//       (which may simply be undefined)
export const VersionWrite_Rest_Schema = Validate.object({
  web: WebVersionWrite_Rest_Schema
      .nullable()/*how `undefined` (no value) comes across REST*/
      .notRequired()/*if unspecified then leave unchanged*/,
}).noUnknown();
export type _VersionWrite_Rest = Validate.InferType<typeof VersionWrite_Rest_Schema>;
export type VersionWrite_Rest = Modify<_VersionWrite_Rest, Partial<Pick<_VersionWrite_Rest, 'web'>>>/*FIXME Yup problem with notRequired()*/;
