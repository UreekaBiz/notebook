
// convenience functions for working with Strings
// ********************************************************************************
// REF: https://www.typescriptlang.org/docs/handbook/2/conditional-types.html
export type OptionalNullableString<T> =
  T extends string ? string :
  T extends null ? null :
  undefined;

// ================================================================================
export const isString = (value: any): value is String => typeof value === 'string' || value instanceof String;

// ================================================================================
export const isBlank = (s: string | null | undefined) => {
  if(!s) return true;
  return (s.trim().length < 1);
};
export const defaultBlankString = <T>(s: string | null | undefined, defaultValue: T) =>
  isBlank(s) ? defaultValue : s!;

// --------------------------------------------------------------------------------
// REF: https://stackoverflow.com/questions/175739/how-can-i-check-if-a-string-is-a-valid-number
export const isNumber = (str: string) => {
  return !isNaN(str as any) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
          !isNaN(parseFloat(str)); // ...and ensure strings of whitespace fail
};

// --------------------------------------------------------------------------------
export const trim = <T extends string | null | undefined>(s: T): OptionalNullableString<T> =>
  isBlank(s)
    ? s/*by contract*/ as any/*REF: https://github.com/microsoft/TypeScript/issues/24929*/
    : s!.trim();

export const splitTrim = <T extends string | null | undefined>(s: T, separator: string | RegExp): OptionalNullableString<T[]> =>
  isBlank(s)
    ? s/*by contract*/ as any/*REF: https://github.com/microsoft/TypeScript/issues/24929*/
    : s!.split(separator)
      .map(split => split.trim());

// ================================================================================
// does the string contains a valid hexadecimal code?
// REF: https://www.geeksforgeeks.org/how-to-validate-hexadecimal-color-code-using-regular-expression/#:~:text=regex%20%3D%20%22%5E%23(%5BA%2D,with%20a%20'%23'%20symbol.
export const hexString = (string: string) => /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(string);

// --------------------------------------------------------------------------------
// CHECK: this doesn't cover 'UPPERlower' but that isn't traditional camel-case regardless
export const camelToKebabCase = (s: string) =>
  s.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();

// ================================================================================
// REF: https://stackoverflow.com/questions/10805125/how-to-remove-all-line-breaks-from-a-string
export const removeNewLines = (text: string) =>
  text.replace(/(\r\n|\n|\r)/gm, '');

// --------------------------------------------------------------------------------
/**
 * @returns an array of strings such that the specified array minus the returned
 *          array gives a unique set of strings
 */
export const duplicateStrings = (strings: string[]): string[] => {
  const uniqueStrings = new Set<string>();
  const duplicates: string[] = []/*none by default*/;
  for(const s of strings) {
    if(uniqueStrings.has(s)) duplicates.push(s)/*already exists so record it*/;
    else uniqueStrings.add(s)/*doesn't exist so add it*/;
  }

  return duplicates;
};
