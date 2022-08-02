import * as md5 from 'crypto-js/md5';
import * as hex from 'crypto-js/enc-hex';

// utilities for working with hashed (e.g. MD5) values
// ********************************************************************************
export const hashString = (s: string): string => hex.stringify(md5(s));

export const hashNumber = (n: number): string => hashString(n.toString());

// --------------------------------------------------------------------------------
// for cases where a UserIdentifier needs to be turned into a 'good enough' number
// NOTE: this is effectively Java's string's hash-code
export const stringHashCode = (s: string) => {
  if(s.length < 1) return 0/*default for zero-length string*/;

  var hash = 0;
  for(let i=0; i<s.length; i++)
    hash = ((hash << 5) - hash + s.charCodeAt(i)) << 0/*convert to 32-bit integer*/;
  return hash;
};
