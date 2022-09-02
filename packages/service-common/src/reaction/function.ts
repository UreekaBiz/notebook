import * as Validate from 'yup';

import { Identifier_Schema, Modify } from '../util/type';
import { ReactionTarget, ReactionType } from './type';

// ********************************************************************************
// NOTE: the User is implicit as the caller of the function
export const ReactionToggle_Rest_Schema = Validate.object({
  type: Validate.string()
          .oneOf(Object.values(ReactionType))
          .required(),

  target: Validate.string()
          .oneOf(Object.values(ReactionTarget))
          .required(),
  entityId: Identifier_Schema
          .required(),
}).noUnknown();
export type ReactionToggle_Rest = Modify<Validate.InferType<typeof ReactionToggle_Rest_Schema>, Readonly<{
  type: ReactionType/*explicit*/;
  target: ReactionTarget/*explicit*/;
}>>;
