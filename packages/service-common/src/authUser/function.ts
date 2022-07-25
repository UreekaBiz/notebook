import * as Validate from 'yup';

import { UserProfile_Core, UserProfile_Core_Schema, UserProfile_Private, UserProfile_Private_Schema } from '../user/type';
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
