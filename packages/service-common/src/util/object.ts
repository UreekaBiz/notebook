import { cloneDeep, set } from 'lodash';

import { isBlank } from './string';

// convenience methods and types for working with objects
// ********************************************************************************

export const isObject = (o: unknown): o is object =>
  !!o && ((typeof o === 'object') || (typeof o === 'function'/*Javascript 'object'*/));

export const nameof = <T>(k: keyof T): keyof T => k;

// == Type Parallels ==============================================================
// .. Omit ........................................................................
export const omit = <T extends Record<string, any>, K extends keyof T>(o: T, ...keys: K[]): Omit<T, K> => {
  const keysToRemove = new Set(keys.map(key => String(key)));
  const result: any = {};
    Object.keys(o)
      .filter(key => !keysToRemove.has(key))
      .forEach(key => result[key] = o[key]);
  return result;
};

// .. Pick ........................................................................
export const pick = <T, K extends keyof T>(o: T, ...keys: K[]): Pick<T, K> => {
  const result: any = {};
    keys.forEach(key => result[key] = o[key]);
  return result;
};

// ................................................................................

// == Conversion ==================================================================
export const convertNull = <T extends Record<string, any>>(o: T, convert: any): T => {
  const result: any = {};
    Object.keys(o).forEach(key => { result[key] = ((o[key] === null) ? convert : o[key]); });
  return result;
};
export const convertNullDeep = <T extends Record<string, any>>(o: T, convert: any, omit?: string[]): T => {
  const result: any = {};
    Object.keys(o)
      .forEach(key => {
        const value = o[key];
        if(omit && omit.includes(key)) { /*key included in omit*/
          result[key] = value/*don't convert*/;
          return/*don't descend by contract*/;
        } /* else -- omit not specified or key not omitted */

        result[key] = (value === null)
                        ? convert
                        : (typeof value === 'object')
                            ? convertNullDeep(value, convert, omit)
                            : value;
      });
  return result;
};

export const convertUndefined = <T extends Record<string, any>>(o: T, convert: any): T => {
  const result: any = {};
    Object.keys(o).forEach(key => { result[key] = ((o[key] === undefined) ? convert : o[key]); });
  return result;
};
export const convertUndefinedDeep = <T extends Record<string, any>>(o: T, convert: any, omit?: string[]): T => {
  const result: any = {};
    Object.keys(o)
      .forEach(key => {
        const value = o[key];
        if(omit && omit.includes(key)) { /*key included in omit*/
          result[key] = value/*don't convert*/;
          return/*don't descend by contract*/;
        } /* else -- omit not specified or key not omitted */

        result[key] = (value === undefined)
                        ? convert
                        : (typeof value === 'object')
                            ? convertUndefinedDeep(value, convert, omit)
                            : value;
      });
  return result;
};

export const convertNullUndefined = <T extends Record<string, any>>(o: T, convert: any): T => {
  const result: any = {};
    Object.keys(o).forEach(key => { result[key] = (((o[key] === null) || (o[key] === undefined)) ? convert : o[key]); });
  return result;
};
export const convertNullUndefinedDeep = <T extends Record<string, any>>(o: T, convert: any, omit?: string[]): T => {
  const result: any = {};
    Object.keys(o)
      .forEach(key => {
        const value = o[key];
        if(omit && omit.includes(key)) { /*key included in omit*/
          result[key] = value/*don't convert*/;
          return/*don't descend by contract*/;
        } /* else -- omit not specified or key not omitted */

        result[key] = ((value === null) || (value === undefined))
                        ? convert
                        : (typeof value === 'object')
                            ? convertNullUndefinedDeep(value, convert, omit)
                            : value;
      });
  return result;
};

// ................................................................................
export const convertBlankString = <T extends Record<string, any>>(o: T, convert: any): T => {
  const result: any = {};
    Object.keys(o).forEach(key => { result[key] = (((typeof o[key] === 'string') && isBlank(o[key])) ? convert : o[key]); });
  return result;
};

export const convertNullToUndefined = <T>(value: T | null | undefined) =>
  (value === null) ? undefined : value;

// --------------------------------------------------------------------------------
// CHECK: can this do better than Partial<T>?
export const removeValue = <T extends Record<string, any>>(o: T, value: any): Partial<T> => {
  const result: any = {};
    Object.keys(o).forEach(key => { if(o[key] !== value) result[key] = o[key]; });
  return result;
};

export const removeNull = <T>(o: T) => removeValue(o, null)/*for convenience*/;
export const removeUndefined = <T>(o: T) => removeValue(o, undefined)/*for convenience*/;

// ================================================================================
export const mapKeys = <V>(object: Record<string, V>, fn: (value: V, key: string, o: any) => string) => {
  const result: Record<string, V> = {};
  Object.keys(object).forEach((key) => {
    const value = object[key];
    result[fn(value, key, object)] = value;
  });
  return result;
};

export const mapValues = <Vi, Vf>(object: Record<string, Vi>, fn: (value: Vi, key: string, o: any) => Vf): Record<string, Vf> => {
  const result: Record<string, Vf> = {};
  Object.keys(object).forEach((key) => {
    result[key] = fn(object[key], key, object);
  });
  return result;
};

// ================================================================================
// clones the specified objects and sets the value at all of the paths to '<redacted>'
export const redact = <T extends object>(o: T, paths: string[]) => {
  const clone = cloneDeep(o);
    // TODO: this should only redact the values if they exists
    paths.forEach(path => set(clone, path, '<redacted>'));
  return clone;
};
