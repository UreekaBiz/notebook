// ********************************************************************************

import { APIKey } from '@ureeka-notebook/web-service';

// == API Keys ====================================================================
export const ReadableAPIKey: Record<APIKey, string> = {
  [APIKey.Vendor1]: 'Vendor 1',
  [APIKey.Vendor2]: 'Vendor 2',
};
export const getReadableAPIKey = (apiKey: APIKey) => ReadableAPIKey[apiKey];
