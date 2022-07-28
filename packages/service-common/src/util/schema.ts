import * as URI from 'uri-js';
import { object, reach, string, AnySchema, ObjectSchema, ValidationError } from 'yup';
import { MixedSchema } from 'yup/lib/mixed';
import { Assign, ObjectShape } from 'yup/lib/object';

import { createApplicationError } from './error';

// convenience functions for working with Schemas (specifically Yup)
// ********************************************************************************
/**
 * @param schema an {@link ObjectSchema} whose fields are all to be converted to
 *        'not required' to emulate what `Partial` does. All fields must have a
 *        {@link MixedType} schema for this to be valid. The schema cannot be
 *        nested (or, more specifically, this applies a shallow 'partial').
 * @returns the specified schema with all fields 'not required'
 */
 export const partialSchema = <T extends ObjectShape, U extends ObjectShape>(schema: ObjectSchema<T>): ObjectSchema<Assign<Partial<T>, U>> => {
  // NOTE: the cast to 'any' on the outer return type is due to the fact that the
  //       types of the individual fields are not known here. Yup does not seem
  //       to expose the 'inner' (schema) types.
  const notRequired = (key: string) => (reach(schema, key) as MixedSchema).notRequired();

  const schemaDescription = schema.describe();
  const fields = schemaDescription.fields;
  let partialSchema =
      object().shape({
        ...Object.keys(fields).reduce((o, key) => ({ ...o, [key]: notRequired(key) }), {}),
      });
  // CHECK: what other 'modifiers' might exist on the top-level schema that need to
  //        be applied ala 'noUnknown'?
  if(schemaDescription.tests.some(test => test.name === 'noUnknown')) partialSchema = partialSchema.noUnknown();

  return partialSchema as any/*SEE: note above*/;
};
/**
 * @param schema an {@link ObjectSchema} whose fields are to be picked.
 * @param keys the names of the fields to be picked
 * @returns the specified schema with all fields that were picked
 * @see #omitSchema()
 */
 export const pickSchema = <T extends ObjectShape, K extends keyof T>(schema: ObjectSchema<T>, ...keys: K[]): ObjectSchema<Pick<T, K>> => {
  // NOTE: this assumes string keys (since Yup assumes string keys)
  return object().shape({
    ...keys.reduce((o, key) => ({ ...o, [key]: reach(schema, String(key)) }), {}),
  }) as any;
};

/**
 * @param schema an {@link ObjectSchema} whose fields are to be omitted from the
 *        resulting schema
 * @param keys the names of the fields to be omitted
 * @returns the specified schema with all fields except those that were omitted
 * @see #pickSchema()
 */
export const omitSchema = <T extends ObjectShape, K extends keyof T>(schema: ObjectSchema<T>, ...keys: K[]): ObjectSchema<Omit<T, K>> => {
  // NOTE: this assumes string keys (since Yup assumes string keys)
  const removeKeys = new Set(keys.map(key => String(key)));
  const fields = schema.describe().fields;
  return object().shape({
    ...Object.keys(fields)
                .filter(key => !removeKeys.has(key))
                .reduce((o, key) => ({ ...o, [key]: reach(schema, String(key)) }), {}),
  }) as any;
};


// == Validation ==================================================================
export const validateData = (data: any, schema: AnySchema<any>, consoleLog: boolean = true/*log by default*/) => {
  try {
    schema.validateSync(data, {
      abortEarly: false/*report all errors*/,
      strict: false/*true prevents ISO dates from being passed as strings to date()*/,
      stripUnknown: false/*don't strip -- meaning fail on unknown parameters*/,
    });
  } catch(error) {
    let message = `Data does not match schema.`;

    if(error instanceof ValidationError) {
      if(error.errors.length > 0) message += ` Validation errors: ` + error.errors.map(error => `"${error}"`);
      if(consoleLog) console.error(message);
    } else {/*something other than a ValidationError*/
      if(error instanceof Error) message += `Reason: ${error.message}`;
      else message += `Reason: ${error}`;
      if(consoleLog) {
        console.error(message,
                      `\n\tReceived: `, JSON.stringify(data),
                      `\n\tWanted: `, JSON.stringify(schema.describe()));
      } /* else -- caller doesn't want logged */
    }
    throw createApplicationError('functions/invalid-argument', message);
  }
};

// == Convenience =================================================================
// -- Strings ---------------------------------------------------------------------
export const stringVLongSchema = string()
    .trim()
    .max(1024 * 10);

export const stringLongSchema = string()
    .trim()
    .max(1024 * 2);

export const stringMedSchema = string()
    .trim()
    .max(1024);

export const stringShortSchema = string()
    .trim()
    .max(255);

// -- Email -----------------------------------------------------------------------
export const emailSchema = stringMedSchema/*bounded length for sanity*/
    .email();

// -- URLs / Social ---------------------------------------------------------------
// .. URL .........................................................................
// a string()-based relaxed URL schema that allows for users to enter URL's such as
// 'www.google.com' (e.g. URLs without protocols, etc.)
// TODO: revisit and tighten this up
// NOTE: if the Capture Groups of this RegExp are changed then #domainReportCanonicalizeDomain()
//       *must* be changed!
export const RELAXED_URL_REGEXP = /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/|www\.)?([a-z0-9]+([.-]{1}[a-z0-9]+)*\.[a-z]{2,63}(:[0-9]{1,5})?)(\/.*)?$/i;
export const relaxedUrlSchema = string()
    .matches(RELAXED_URL_REGEXP);

// a string()-based strict URL schema that allows for users to enter URL's such as
// 'localhost'. This implementation is not using Yups' built-in URL schema since it
// doesn't allow 'localhost'. A RegExp is not used since creating a RegExp that
// complains with the CWE-1333 error is not a easy task. The schema uses an RFC 3986
// compliant scheme that do this work.
// NOTE: the following bug is not fixed: https://github.com/jquense/yup/issues/224
// REF: https://github.com/jquense/yup/blob/master/src/string.js#L9
export const urlSchema = string()
    .test('URL_REGEXP', 'Invalid URL', value => {
      if(value === undefined) return false/*value must be defined*/;

      try {
        const parsed = URI.parse(value);
        // parsed value must have a defined host and scheme
        if(parsed.host === undefined || parsed.scheme === undefined) return false;
        return true/*by contract*/;
      } catch(error){
        // Unexpected error happened while parsing the URL. URI.parse() should only
        // return an invalid object that is handled above.
        console.error(`Error parsing URL for value (${value}):`, error);
        return false/*by contract*/;
      }
    });

// .. Social ......................................................................
// TikTok handle (2-24 chars (numbers, letters, underscore or periods with possible
// leading '@')
export const tiktokHandleSchema = stringShortSchema
    .matches(/^@?([\w.]){2,24}$/i);

// Twitter handle (1-15 chars with possible leading '@')
export const twitterHandleSchema = stringShortSchema
    .matches(/^@?(\w){1,15}$/i);
