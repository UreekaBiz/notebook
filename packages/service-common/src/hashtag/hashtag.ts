import { extractHashtags } from 'twitter-text';

// ********************************************************************************
export {
  extractHashtags,
  isValidHashtag,
} from 'twitter-text';

// ================================================================================
export const extractHashtagSet = (body: string): Set<string> =>
  new Set(extractHashtags(body));
