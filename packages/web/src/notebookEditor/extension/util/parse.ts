import md5 from 'crypto-js/md5';
import hex from 'crypto-js/enc-hex';

import { isString } from '@ureeka-notebook/web-service';

// ********************************************************************************
// == Type ========================================================================
type GetAttrsReturnType = ((p: string | Node) => false | { [key: string]: any; } | null | undefined) | null | undefined;

// == Validation ==================================================================
/**
 * Validates that a string is a valid HTML tag
 *
 * @param tag The string whose HTML-tag-validity will be validated
 * @returns A boolean indicating whether or not the given string is a valid HTML tag
 */
const isValidHTMLTag = (tag: string): boolean => document.createElement(tag).toString() !== '[object HTMLUnknownElement]';

/**
 * Validates that an object is a valid {@link HTMLElement}
 *
 * @param object The object that will be validated
 * @returns A boolean indicating whether or not the given object is a valid {@link HTMLElement}
 */
export const isValidHTMLElement = (object: any): object is HTMLElement => object instanceof HTMLElement;

// == Tag =========================================================================
/**
 * Wrapper around {@link isValidHTMLTag} that throws if {@link isValidHTMLTag}
 * fails or returns an object with the given tagName as its tag key
 *
 * @param tagName The HTML tag name to be passed to {@link isValidHTMLTag}
 * @returns An object with an explicitly defined tag property whose value that
 *          matches the given tagName
 */
export const safeParseTag = (tagName: string) => {
  if(!isValidHTMLTag(tagName)) throw new Error(`Invalid tag name: ${tagName}`);
  return { tag: tagName };
};

/**
 * A wrapper function that allows parseHTML node getAttr calls to safely use node
 * as an HTMLElement
 *
 * @param getAttrsCallback The callback function that will be used as the getAttrs call
 * @returns An instance of {@link GetAttrsReturnType}
 */
export const wrapGetTagAttrs = (getAttrsCallback: (node: HTMLElement) => boolean | { [key: string]: any; } | null | undefined): GetAttrsReturnType => {
  const validatedGetAttrsFunction: GetAttrsReturnType = (node) =>
    !isValidHTMLElement(node)
      ? null
      : getAttrsCallback(node) && null/*required by GetAttrsReturnType*/;

  return validatedGetAttrsFunction;
};

// == String ======================================================================
 // utilities for working with hashed (MD5) values
 export const hashString = (s: string): string => hex.stringify(md5(s));
 export const hashNumber = (n: number): string => hashString(n.toString());

// == Style =======================================================================
/**
 * A wrapper function that allows parseHTML style getAttr calls to safely use node
 * as an HTMLElement
 *
 * @param getAttrsCallback The callback function that will be used as the getAttrs call
 * @returns An instance of {@link GetAttrsReturnType}
 */
export const wrapGetStyleAttrs = (getAttrsCallback: (value: string) => boolean | { [key: string]: any; } | null | undefined): GetAttrsReturnType => {
  const validatedGetAttrsFunction: GetAttrsReturnType = (value) =>
    !isString(value)
      ? null
      : getAttrsCallback(value) && null/*required by GetAttrsReturnType*/;

  return validatedGetAttrsFunction;
};
