import * as Validate from 'yup';

import { stringMedSchema } from '../util/schema';

// ********************************************************************************
// NOTE: this isn't called by any client per se. It's called server-side by the
//       healthcheck function
// SEE: @cloud-functions: /healthcheck
export const VersionResponse_Schema = Validate.object({
  buildDate: stringMedSchema/*UTC*/
      .min(1/*cannot be blank*/)
      .required(),
  version: stringMedSchema/*package.json*/
      .min(1/*cannot be blank*/)
      .required(),

  gitBranch: stringMedSchema/*build*/
      .min(1/*cannot be blank*/)
      .required(),
  gitHash: stringMedSchema/*build*/
      .min(1/*cannot be blank*/)
      .required(),
});
export type VersionResponse = Readonly<Validate.InferType<typeof VersionResponse_Schema>>;
