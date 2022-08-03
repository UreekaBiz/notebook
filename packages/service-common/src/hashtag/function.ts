import { isValidHashtag } from 'twitter-text';
import * as Validate from 'yup';

import { stringMedSchema } from '../util/schema';

// ********************************************************************************
// == Admin-Only ==================================================================
export const AdminHashtagRemoveUpdate_Rest_Schema = Validate.object({
  hashtag: stringMedSchema
          .min(1/*cannot be blank*/)
          .test('HASHTAG', 'Invalid Hashtag', value => {
            if(value === undefined) return false/*value must be defined (since required)*/;
            return isValidHashtag(value);
          })
          .required(),

  remove: Validate.bool()
        .required(),
}).noUnknown();
export type AdminHashtagRemoveUpdate_Rest = Validate.InferType<typeof AdminHashtagRemoveUpdate_Rest_Schema>;
