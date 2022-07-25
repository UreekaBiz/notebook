import { customAlphabet, nanoid } from 'nanoid';

// ********************************************************************************
// NOTE: at a minimum the id must be URL-safe (i.e. without the need to URL encode)
// NOTE: this is expected to be used within a given context (e.g. within a document)
//       and therefore does not need to have as much randomness as, say, UUIDv4
const customNanoid = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', 10/*T&E*/);
export const generateUUID = () => customNanoid();

// --------------------------------------------------------------------------------
// UUID v4 "equivalent"
// REF: https://github.com/ai/nanoid#comparison-with-uuid
export const generateUuid = () => nanoid();

const shortNanoid = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', 6/*T&E*/);
export const generateShortUuid = () => shortNanoid();
