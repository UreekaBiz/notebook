import * as Validate from 'yup';

import { stringMedSchema } from '../util/schema';
import { HashtagContentRegExp } from './regexp';

// ********************************************************************************
// == Admin-Only ==================================================================
export const AdminHashtagRemoveUpdate_Rest_Schema = Validate.object({
  hashtag: stringMedSchema
          .min(1/*cannot be blank*/)
          .matches(HashtagContentRegExp)
          .required(),

  remove: Validate.bool()
        .required(),
}).noUnknown();
export type AdminHashtagRemoveUpdate_Rest = Validate.InferType<typeof AdminHashtagRemoveUpdate_Rest_Schema>;
