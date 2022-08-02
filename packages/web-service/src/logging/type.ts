import log from 'loglevel';

import { Logger, ServiceLogger } from '@ureeka-notebook/service-common';

// ** Service-Common **************************************************************
export {
  // SEE: @ureeka-notebook/service-common: logging/type.ts
  Logger,
  LogLevel,
  LogView,
  ServiceLogger,
} from '@ureeka-notebook/service-common';

// ********************************************************************************
// NOTE: located here to eliminate circular dependencies
// convenience accessor to retrieve the log.Logger for the specified enum
export const getLogger = (logger: ServiceLogger | Logger) => log.getLogger(logger);
