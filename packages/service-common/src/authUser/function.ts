import * as Validate from 'yup';

import { UserConfigurationType, UserProfile_Private, UserProfile_Private_Schema } from '../authUser/type';
import { UserProfile_Core, UserProfile_Core_Schema } from '../user/type';
import { omitSchema } from '../util/schema';
import { Identifier_Schema, Modify } from '../util/type';
import { ActivityState, Session_Schema } from './type';

// ********************************************************************************
// == Session =====================================================================
export const SessionClear_Rest_Schema = Validate.object({
  sessionId: Identifier_Schema
          .required(),
}).noUnknown();
export type SessionClear_Rest = Readonly<Validate.InferType<typeof SessionClear_Rest_Schema>>;

// fields that are specified in the update are overwritten with the specified value.
// If that value is `null` or `undefined` then that field is removed. Any fields
// that are not specified (as allowed by the Schema) in the update remain unchanged.
export const SessionUpdate_Rest_Schema =
  SessionClear_Rest_Schema
    .concat(omitSchema(Session_Schema, 'timestamp'))/*'timestamp' not explicitly sent since server-set*/
    .noUnknown();
export type SessionUpdate_Rest = Readonly<Modify<Validate.InferType<typeof SessionUpdate_Rest_Schema>, {
  activity: ActivityState/*explicit*/;
}>>;

// == User Profile Private ========================================================
// fields that are specified in the update are overwritten with the specified value.
// If that value is `null` or `undefined` then that field is removed. Any fields
// that are not specified (as allowed by the Schema) in the update remain unchanged.
export const UserProfilePrivateUpdate_Rest_Schema =
  UserProfile_Core_Schema
        .concat(UserProfile_Private_Schema)
    .noUnknown()/*for sanity*/;
export type UserProfilePrivateUpdate_Rest =
    UserProfile_Core
  & UserProfile_Private
  ;

// == User Configuration ==========================================================
// -- CUD -------------------------------------------------------------------------
// .. Create ......................................................................
export const UserConfigurationCreate_Rest_Schema = Validate.object({
  type: Validate.string()
      .oneOf(Object.values(UserConfigurationType))
      .required(),
  order: Validate.number()
      .required(),

  /** the payload must exist but its schema is dictated by the type and is validated
   *  separately */
  payload: Validate.object()
      .required(),
}).noUnknown();
export type UserConfigurationCreate_Rest = Modify<Validate.InferType<typeof UserConfigurationCreate_Rest_Schema>, Readonly<{
  type: UserConfigurationType/*explicit*/;
}>>;

// .. Update ......................................................................
// the payload is written in full -- there is no way to incrementally update it.
// The type cannot be changed.
export const UserConfigurationUpdate_Rest_Schema = Validate.object({
  configId: Identifier_Schema
      .required(),
}).concat(omitSchema(UserConfigurationCreate_Rest_Schema, 'type')).noUnknown();
export type UserConfigurationUpdate_Rest = Validate.InferType<typeof UserConfigurationUpdate_Rest_Schema>;

// .. Delete ......................................................................
export const UserConfigurationDelete_Rest_Schema = Validate.object({
  configId: Identifier_Schema
      .required(),
}).noUnknown();
export type UserConfigurationDelete_Rest = Readonly<Validate.InferType<typeof UserConfigurationDelete_Rest_Schema>>;
