import { HashtagRegExp } from './regexp';
import { normalizeHashtag } from './type';

// ********************************************************************************
export const extractHashtagsFromString = (body: string): Set<string> => {
  const hashtags = new Set<string>();
  let matches: string[] | null/*done*/;
  while((matches = HashtagRegExp.exec(body)) !== null) { // tslint:disable-line: no-conditional-assignment
    hashtags.add(normalizeHashtag(matches[/*$*/1]));
  }

  return hashtags;
};
