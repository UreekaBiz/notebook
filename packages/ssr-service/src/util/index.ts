// ** Local ***********************************************************************
// NOTE: './firebase' is exported from the root to ensure that it's processed first
export * from './auth';
export * from './nextjs';

// ** Service-Common **************************************************************
export {
  // SEE: @ureeka-notebook/service-common: util/schema.ts
  Identifier_Schema,
} from '@ureeka-notebook/service-common';
