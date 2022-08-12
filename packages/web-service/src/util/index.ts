// ** Local ***********************************************************************
// NOTE: './firebase' is exported from the root to ensure that it's processed first
export * from './environment';
export * from './error';
export * from './version';

// ** Service-Common **************************************************************
export {
  // SEE: @ureeka-notebook/service-common: util/array.ts
  duplicateStrings,
  groupBy,
  orderedGroupBy,
  splitIntoChunks,
  swap,

  // SEE: @ureeka-notebook/service-common: util/datastore.ts
  objectTuple,
  ObjectTuple,
  Timestamp,

  // SEE: @ureeka-notebook/service-common: util/debounce.ts
  debounce,

  // SEE: @ureeka-notebook/service-common: util/environment.ts
  isClientSide,
  isServerSide,

  // SEE: @ureeka-notebook/service-common: util/hash.ts
  hashNumber,
  hashString,
  stringHashCode,

  // SEE: @ureeka-notebook/service-common: util/map.ts
  mapEquals,

  // SEE: @ureeka-notebook/service-common: util/object.ts
  generateRange,
  range,
  Range,

  // SEE: @ureeka-notebook/service-common: util/object.ts
  convertBlankString,
  convertNull,
  convertNullUndefined,
  convertUndefined,
  nameof,
  omit,
  pick,
  removeNull,
  removeUndefined,
  removeValue,

  // SEE: @ureeka-notebook/service-common: util/predicate.ts
  isDefined,
  isPresent,
  isNotNull,
  isTupleDefined,
  isTuplePresent,
  isTupleNotNull,
  Comparator,
  NumberComparator,
  StringComparator,
  StringNumberComparator,
  TimestampComparator,

  // SEE: @ureeka-notebook/service-common: util/schema.ts
  emailSchema,
  urlSchema,

  // SEE: @ureeka-notebook/service-common: util/set.ts
  differenceSet,
  intersectionSet,

  // SEE: @ureeka-notebook/service-common: util/share.ts
  ShareRole,

  // SEE: @ureeka-notebook/service-common: util/string.ts
  camelToKebabCase,
  defaultBlankString,
  hexString,
  isBlank,
  isString,
  isNumber,
  splitTrim,
  trim,

  // SEE: @ureeka-notebook/service-common: util/throttle.ts
  throttle,

  // SEE: @ureeka-notebook/service-common: util/type.ts
  isType,
  Identifier,
  Modify,
  PartialRecord,

  // SEE: @ureeka-notebook/service-common: util/user.ts
  UserIdentifier,

  // SEE: @ureeka-notebook/service-common: util/uuid.ts
  generateUUID,
} from '@ureeka-notebook/service-common';
