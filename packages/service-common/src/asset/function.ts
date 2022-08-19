import * as Validate from 'yup';

import { stringMedSchema } from '../util/schema';
import { Identifier_Schema } from '../util/type';

// ********************************************************************************
// == Asset =======================================================================
// -- Update / Delete -------------------------------------------------------------
// NOTE: Assets are automatically created when they're uploaded to GCS

// .. Update ......................................................................
export const AssetUpdate_Rest_Schema = Validate.object({
  assetId: Identifier_Schema
      .required(),

  // NOTE: the type of an Asset cannot be changed. It's defined on creation

  name: stringMedSchema
      .nullable()/*how `undefined` (no value) comes across REST*/
      .notRequired()/*if unspecified then left unchanged*/,
  description: stringMedSchema
      .nullable()/*how `undefined` (no value) comes across REST*/
      .notRequired()/*if unspecified then left unchanged*/,
}).noUnknown();
type _AssetUpdate_Rest = Validate.InferType<typeof AssetUpdate_Rest_Schema>;
export type AssetUpdate_Rest = Pick<_AssetUpdate_Rest, 'assetId'> & Partial<Omit<_AssetUpdate_Rest, 'assetId'>>/*FIXME Yup problem with notRequired()*/;

// .. Delete ......................................................................
export const AssetDelete_Rest_Schema = Validate.object({
  assetId: Identifier_Schema
      .required(),
}).noUnknown();
export type AssetDelete_Rest = Readonly<Validate.InferType<typeof AssetDelete_Rest_Schema>>;
