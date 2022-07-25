import * as md5 from 'crypto-js/md5';
import * as hex from 'crypto-js/enc-hex';

// utilities for working with hashed (MD5) values
// ********************************************************************************
export const hashString = (s: string): string => hex.stringify(md5(s));

export const hashNumber = (n: number): string => hashString(n.toString());
