import { VersionResponse } from './function';

// ********************************************************************************
// the parameter passed on a Cloud-Function call to query its version information
export const VERSION_REQUEST = `__version`;

// ================================================================================
type Result = Readonly<({
  result: false/*didn't return*/;
} | {
  elapsedTime: number/*elapsed time to return healthcheck*/;
  result: VersionResponse;
})>;
export type HealthcheckStatus = Readonly<{
  name: string/*name of function*/;
}> & Result;

// ................................................................................
export type HealthcheckResult = Readonly<{
  /** did *all* endpoints return successfully? */
  success: boolean;

  /** in the case of `success === false` then this *only* includes the failed endpoints */
  statuses: HealthcheckStatus[];
}>;
