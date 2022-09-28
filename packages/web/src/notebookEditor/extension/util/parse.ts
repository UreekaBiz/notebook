import { isString } from '@ureeka-notebook/web-service';

// ********************************************************************************
// == Type ========================================================================
type GetAttrsReturnType = ((p: string | Node) => false | { [key: string]: any; } | null ) | undefined;

// == Validation ==================================================================
/**
 * @param tag The string whose HTML-tag-validity will be validated
 * @returns `true` if the given string is a valid HTML tag. `false` otherwise
 */
const isValidHTMLTag = (tag: string): boolean => document.createElement(tag).toString() !== '[object HTMLUnknownElement]';

/**
 * @param object The object that will be validated
 * @returns `true` if given object is a valid {@link HTMLElement}. `false` otherwise
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
export const wrapGetTagAttrs = (getAttrsCallback: (node: HTMLElement) => boolean | { [key: string]: any; } | null): GetAttrsReturnType => {
  const validatedGetAttrsFunction: GetAttrsReturnType = (node) =>
    !isValidHTMLElement(node)
      ? null/*not a valid HTML Element*/
      : getAttrsCallback(node) && null/*required by GetAttrsReturnType*/;

  return validatedGetAttrsFunction;
};

// == Element ========================================================================
/** parse a string and return a {@link HTMLElement} */
export const elementFromString = (value: string): HTMLElement =>
  new window.DOMParser().parseFromString(`<body>${value}</body>`/*wrap to preserve whitespace*/, 'text/html').body;

// == Style =======================================================================
/**
 * A wrapper function that allows parseHTML style getAttr calls to safely use Node
 * as an HTMLElement
 *
 * @param getAttrsCallback The callback function that will be used as the getAttrs call
 * @returns An instance of {@link GetAttrsReturnType}
 */
export const wrapGetStyleAttrs = (getAttrsCallback: (value: string) => boolean | { [key: string]: any; } | null): GetAttrsReturnType => {
  const validatedGetAttrsFunction: GetAttrsReturnType = (value) =>
    !isString(value)
      ? null/*not a string*/
      : getAttrsCallback(value) && null/*required by GetAttrsReturnType*/;

  return validatedGetAttrsFunction;
};
